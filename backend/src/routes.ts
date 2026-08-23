import { Router, type Request, type Response } from 'express';
import { getState, getOrders, updateState } from './state.js';
import { copytrade } from './engines/copytrade.js';
import { sniping } from './engines/sniping.js';
import { feeder } from './engines/feeder.js';
import { createOrder, buildOrder, submitSigned, rejectOrder } from './orders.js';
import { balanceOf } from './solana/wallet.js';
import { logger } from './logger.js';
import { config } from './config.js';

export const api = Router();

/** Wrapper : capture les erreurs async et renvoie un 400 propre. */
const h =
  (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) => {
    fn(req, res).catch((e) => {
      logger.error('api', `${req.method} ${req.path} → ${e?.message ?? e}`);
      res.status(400).json({ error: e?.message ?? String(e) });
    });
  };

// ---------------- État global ----------------
api.get('/state', (_req, res) => {
  res.json({ state: getState(), orders: getOrders(), config: publicConfig() });
});

api.get('/orders', (_req, res) => res.json({ orders: getOrders() }));

// ---------------- Wallet connecté (seul wallet, non-custodial) ----------------
api.post(
  '/wallet/connect',
  h(async (req, res) => {
    const address = String(req.body?.address ?? '').trim();
    if (!address) throw new Error('address required');
    const balanceSol = await balanceOf(address);
    updateState((s) => {
      s.wallet.connectedAddress = address;
      s.wallet.connectedBalanceSol = balanceSol;
    });
    logger.ok('wallet', `wallet connected: ${address} (${balanceSol.toFixed(4)} SOL)`);
    res.json({ address, balanceSol });
  }),
);

api.post('/wallet/disconnect', (_req, res) => {
  updateState((s) => {
    s.wallet.connectedAddress = null;
    s.wallet.connectedBalanceSol = null;
  });
  logger.info('wallet', 'wallet disconnected');
  res.json({ ok: true });
});

api.get(
  '/wallet/refresh',
  h(async (_req, res) => {
    const connected = getState().wallet.connectedAddress;
    let connectedBalanceSol: number | null = null;
    if (connected) {
      connectedBalanceSol = await balanceOf(connected);
      updateState((s) => void (s.wallet.connectedBalanceSol = connectedBalanceSol));
    }
    res.json({ connectedBalanceSol });
  }),
);

// ---------------- Copytrade ----------------
api.post('/copytrade/start', h(async (_req, res) => (await copytrade.start(), res.json({ ok: true }))));
api.post('/copytrade/stop', h(async (_req, res) => (await copytrade.stop(), res.json({ ok: true }))));

api.post(
  '/copytrade/targets',
  h(async (req, res) => {
    const address = String(req.body?.address ?? '').trim();
    if (!address) throw new Error('address required');
    await copytrade.addTarget(address);
    res.json({ targets: getState().copytrade.targets });
  }),
);

api.delete(
  '/copytrade/targets/:address',
  h(async (req, res) => {
    await copytrade.removeTarget(req.params.address);
    res.json({ targets: getState().copytrade.targets });
  }),
);

api.post('/copytrade/config', (req, res) => {
  updateState((s) => {
    const b = req.body ?? {};
    if (b.amountMode === 'fixed' || b.amountMode === 'proportional') s.copytrade.amountMode = b.amountMode;
    if (Number.isFinite(b.fixedSol)) s.copytrade.fixedSol = Number(b.fixedSol);
    if (Number.isFinite(b.proportionalPct)) s.copytrade.proportionalPct = Number(b.proportionalPct);
  });
  logger.info('copy', 'copytrade config updated');
  res.json({ copytrade: getState().copytrade });
});

// ---------------- Sniping ----------------
api.post('/sniping/start', h(async (_req, res) => (await sniping.start(), res.json({ ok: true }))));
api.post('/sniping/stop', h(async (_req, res) => (await sniping.stop(), res.json({ ok: true }))));

api.post('/sniping/config', (req, res) => {
  updateState((s) => {
    const b = req.body ?? {};
    if (Number.isFinite(b.amountSol)) s.sniping.amountSol = Number(b.amountSol);
    if (Number.isFinite(b.slippageBps)) s.sniping.slippageBps = Number(b.slippageBps);
    if (Number.isFinite(b.maxDelayMs)) s.sniping.maxDelayMs = Number(b.maxDelayMs);
    if (Array.isArray(b.programIds)) s.sniping.programIds = b.programIds.map(String);
  });
  logger.info('snipe', 'sniping config updated');
  res.json({ sniping: getState().sniping });
});

// ---------------- Ordres (chaque tx est signée par l'utilisateur) ----------------
// Achat manuel → crée un ordre EN ATTENTE d'approbation.
api.post('/orders', (req, res) => {
  const outputMint = String(req.body?.outputMint ?? '').trim();
  if (!outputMint) return res.status(400).json({ error: 'outputMint required' });
  const order = createOrder({
    engine: 'manual',
    outputMint,
    amountSol: Number(req.body?.amountSol ?? config.snipe.amountSol),
    slippageBps: Number(req.body?.slippageBps ?? config.trading.maxSlippageBps),
  });
  res.json({ order });
});

// Approbation : construit la tx Jupiter non signée pour l'ordre.
api.post(
  '/orders/:id/build',
  h(async (req, res) => {
    const order = await buildOrder(req.params.id);
    res.json({ order });
  }),
);

// Phantom a SIGNÉ la tx → l'app renvoie la tx signée (base58), le backend la broadcast.
api.post(
  '/orders/:id/submit',
  h(async (req, res) => {
    const signedTx = String(req.body?.signedTx ?? '').trim();
    if (!signedTx) throw new Error('signedTx required');
    const order = await submitSigned(req.params.id, signedTx);
    res.json({ order });
  }),
);

api.post('/orders/:id/reject', (req, res) => {
  const order = rejectOrder(req.params.id);
  res.json({ order });
});

// ---------------- Demo feeder ----------------
api.post('/demo/feed', (req, res) => {
  const on = Boolean(req.body?.on);
  if (on) feeder.start();
  else feeder.stop();
  res.json({ running: feeder.running });
});

api.post(
  '/demo/trigger',
  h(async (req, res) => {
    const engine = String(req.body?.engine ?? 'snipe');
    const mint = String(req.body?.mint ?? 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
    if (engine === 'copy') {
      const target = getState().copytrade.targets[0] ?? 'DemoTarget111111111111111111111111111111111';
      await copytrade.simulateDetection(target, mint);
    } else {
      await sniping.simulateNewPool(mint);
    }
    res.json({ ok: true });
  }),
);

/** Sous-ensemble non sensible de la config, exposé au frontend. */
function publicConfig() {
  return {
    network: config.network,
    maxTradeSol: config.trading.maxTradeSol,
    maxSlippageBps: config.trading.maxSlippageBps,
    inputMint: config.inputMint,
  };
}
