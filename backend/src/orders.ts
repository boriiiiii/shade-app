import { randomUUID } from 'node:crypto';
import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { config } from './config.js';
import { logger } from './logger.js';
import { getState, addOrder, pushOrder, getOrder, incr } from './state.js';
import { buildBuyTransaction, confirmSignature } from './solana/jupiter.js';
import { connection, explorerTx } from './solana/connection.js';
import type { Order } from './types.js';

export interface CreateOrderParams {
  engine: Order['engine'];
  outputMint: string;
  amountSol: number;
  slippageBps: number;
  trigger?: Order['trigger'];
}

function short(m: string) {
  return `${m.slice(0, 8)}…`;
}

/**
 * Crée un ordre EN ATTENTE d'approbation. Rien n'est construit ni signé ici :
 * l'utilisateur devra l'approuver, ce qui déclenchera build() puis la signature
 * dans Phantom. C'est le point d'entrée des moteurs (copytrade/snipe) et du manuel.
 */
export function createOrder(params: CreateOrderParams): Order {
  const wallet = getState().wallet.connectedAddress;
  const source = params.engine === 'snipe' ? 'snipe' : params.engine === 'manual' ? 'manual' : 'copy';

  // Garde-fous appliqués dès la création.
  const amountSol = Math.min(params.amountSol, config.trading.maxTradeSol);
  const slippageBps = Math.min(params.slippageBps, config.trading.maxSlippageBps);

  const order: Order = {
    id: randomUUID(),
    ts: Date.now(),
    engine: params.engine,
    status: wallet ? 'pending' : 'failed',
    wallet: wallet ?? '',
    inputMint: config.inputMint,
    outputMint: params.outputMint,
    amountSol,
    slippageBps,
    trigger: params.trigger,
    error: wallet ? undefined : 'no wallet connected',
  };
  addOrder(order);
  incr.created();

  if (!wallet) {
    logger.warn(source, `order ignored: no Phantom wallet connected (${short(params.outputMint)})`);
    return order;
  }
  logger.trade(source, `order queued → buy ${amountSol} SOL of ${short(params.outputMint)} · awaiting approval`);
  return order;
}

/**
 * Construit la transaction Jupiter (non signée) pour un ordre approuvé.
 * Renvoie la tx en base64 que l'app fera signer dans Phantom.
 */
export async function buildOrder(id: string): Promise<Order> {
  const order = getOrder(id);
  if (!order) throw new Error('order not found');
  if (!order.wallet) throw new Error('order has no wallet');

  order.status = 'building';
  pushOrder(order);
  logger.info('orders', `building tx for ${short(order.outputMint)}…`);

  try {
    const built = await buildBuyTransaction({
      userPublicKey: order.wallet,
      outputMint: order.outputMint,
      amountSol: order.amountSol,
      slippageBps: order.slippageBps,
    });
    order.expectedOut = built.outAmount;
    order.priceImpactPct = built.priceImpactPct;
    order.txBase64 = built.txBase64;
    order.status = 'awaiting';
    pushOrder(order);
    logger.ok('orders', `tx ready (~${built.outAmount} units) → sign in Phantom`);
    return order;
  } catch (e: any) {
    order.status = 'failed';
    order.error = e?.message ?? String(e);
    pushOrder(order);
    incr.failed();
    logger.error('orders', `build failed: ${order.error}`);
    throw e;
  }
}

/**
 * L'app renvoie la transaction SIGNÉE par Phantom (base58) → le backend la
 * broadcast (sendRawTransaction) puis confirme. Modèle non-custodial : Phantom
 * signe, Shade diffuse.
 */
export async function submitSigned(id: string, signedTxB58: string): Promise<Order> {
  const order = getOrder(id);
  if (!order) throw new Error('order not found');

  try {
    const tx = VersionedTransaction.deserialize(bs58.decode(signedTxB58));
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    order.signature = signature;
    order.explorerUrl = explorerTx(signature);
    order.status = 'sent';
    pushOrder(order);
    logger.trade('orders', `tx submitted: ${signature.slice(0, 20)}… → ${order.explorerUrl}`);

    confirmSignature(signature)
      .then(() => {
        order.status = 'confirmed';
        pushOrder(order);
        incr.confirmed();
        logger.ok('orders', `✔ confirmed — ${order.explorerUrl}`);
      })
      .catch((e) => {
        order.status = 'failed';
        order.error = e?.message ?? String(e);
        pushOrder(order);
        incr.failed();
        logger.error('orders', `✘ confirm failed: ${order.error}`);
      });

    return order;
  } catch (e: any) {
    order.status = 'failed';
    order.error = e?.message ?? String(e);
    pushOrder(order);
    incr.failed();
    logger.error('orders', `✘ submit failed: ${order.error}`);
    throw e;
  }
}

export function rejectOrder(id: string): Order {
  const order = getOrder(id);
  if (!order) throw new Error('order not found');
  order.status = 'rejected';
  pushOrder(order);
  logger.warn('orders', `order rejected (${short(order.outputMint)})`);
  return order;
}
