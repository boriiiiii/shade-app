import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { config } from '../config.js';
import { connection } from './connection.js';

/** Appelle l'API Jupiter (quote/swap) avec la clé optionnelle. */
async function jup(path: string, init?: RequestInit): Promise<any> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (config.jupiter.apiKey) headers['x-api-key'] = config.jupiter.apiKey;
  const res = await fetch(`${config.jupiter.baseUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // Cas fréquent en snipe : le token vient de lancer, Jupiter ne l'indexe pas encore.
    if (/route/i.test(body)) {
      throw new Error('no Jupiter route yet (token too new / not indexed — normal for fresh snipes)');
    }
    throw new Error(`Jupiter ${path} → HTTP ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

export interface BuiltSwap {
  txBase64: string; // VersionedTransaction non signée (base64) — à signer dans Phantom
  outAmount: string;
  priceImpactPct: number;
}

/**
 * Construit une tx d'achat SOL→token pour `userPublicKey`, SANS la signer.
 * (Le wallet connecté signera et broadcastera via Phantom.)
 */
export async function buildBuyTransaction(params: {
  userPublicKey: string;
  outputMint: string;
  amountSol: number;
  slippageBps: number;
}): Promise<BuiltSwap> {
  const lamports = Math.floor(params.amountSol * LAMPORTS_PER_SOL);
  const q = new URLSearchParams({
    inputMint: config.inputMint,
    outputMint: params.outputMint,
    amount: String(lamports),
    slippageBps: String(params.slippageBps),
    restrictIntermediateTokens: 'true',
  });
  const quote = await jup(`/quote?${q.toString()}`);

  const swap = await jup('/swap', {
    method: 'POST',
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports:
        config.trading.priorityFee === 'auto' ? 'auto' : Number(config.trading.priorityFee),
    }),
  });

  return {
    txBase64: swap.swapTransaction,
    outAmount: quote.outAmount,
    priceImpactPct: Number(quote.priceImpactPct),
  };
}

/** Attend la confirmation d'une signature (polling, borné dans le temps). */
export async function confirmSignature(signature: string, timeoutMs = 45_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { value } = await connection.getSignatureStatuses([signature]);
    const st = value[0];
    if (st?.err) throw new Error(`tx failed: ${JSON.stringify(st.err)}`);
    if (st && (st.confirmationStatus === 'confirmed' || st.confirmationStatus === 'finalized')) {
      return;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error('confirmation timeout');
}
