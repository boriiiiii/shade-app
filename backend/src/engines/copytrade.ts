import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { connection } from '../solana/connection.js';
import { createOrder } from '../orders.js';
import { logger } from '../logger.js';
import { getState, updateState, incr } from '../state.js';
import { config } from '../config.js';

// Programmes de DEX dont la présence dans les logs = "c'est probablement un swap".
const DEX_PROGRAM_IDS = new Set([
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM v4
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter v6
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpools
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P', // pump.fun
]);

// Mints qu'on ne "copie" pas (SOL/stables) — on cherche le token acheté.
const IGNORED_MINTS = new Set([
  'So11111111111111111111111111111111111111112', // wSOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
]);

class CopyTradeEngine {
  private subs = new Map<string, number>(); // address -> subscription id
  private seen = new Set<string>(); // signatures déjà traitées

  async start() {
    const st = getState();
    if (st.copytrade.running) return;
    updateState((s) => void (s.copytrade.running = true));
    for (const t of st.copytrade.targets) await this.subscribe(t);
    logger.ok('copy', `copytrade engine ON — watching ${st.copytrade.targets.length} target(s)`);
  }

  async stop() {
    for (const [addr, id] of this.subs) {
      await connection.removeOnLogsListener(id).catch(() => {});
      logger.sys('copy', `unsubscribed ${addr.slice(0, 8)}…`);
    }
    this.subs.clear();
    updateState((s) => void (s.copytrade.running = false));
    logger.warn('copy', 'copytrade engine OFF');
  }

  async addTarget(address: string) {
    new PublicKey(address); // valide le format (throw si invalide)
    const st = getState();
    if (st.copytrade.targets.includes(address)) return;
    updateState((s) => void s.copytrade.targets.push(address));
    logger.info('copy', `target added: ${address}`);
    if (st.copytrade.running) await this.subscribe(address);
  }

  async removeTarget(address: string) {
    updateState((s) => {
      s.copytrade.targets = s.copytrade.targets.filter((t) => t !== address);
    });
    const id = this.subs.get(address);
    if (id !== undefined) {
      await connection.removeOnLogsListener(id).catch(() => {});
      this.subs.delete(address);
    }
    logger.info('copy', `target removed: ${address}`);
  }

  private async subscribe(address: string) {
    if (this.subs.has(address)) return;
    const pubkey = new PublicKey(address);
    const id = connection.onLogs(
      pubkey,
      (l) => {
        if (l.err) return;
        this.onLog(address, l.signature, l.logs).catch((e) =>
          logger.error('copy', `log handling: ${e?.message ?? e}`),
        );
      },
      'confirmed',
    );
    this.subs.set(address, id);
    logger.sys('copy', `subscribed to logs of ${address.slice(0, 8)}…`);
  }

  /** Traite une nouvelle transaction émise par une cible. */
  private async onLog(target: string, signature: string, logs: string[]) {
    if (this.seen.has(signature)) return;
    this.seen.add(signature);
    if (this.seen.size > 2000) this.seen = new Set([...this.seen].slice(-1000));

    // Filtre : on ne réagit qu'aux tx qui ressemblent à un swap.
    const looksLikeSwap = logs.some((line) =>
      [...DEX_PROGRAM_IDS].some((pid) => line.includes(pid)),
    );
    if (!looksLikeSwap) return;

    logger.detect('copy', `swap detected from ${target.slice(0, 8)}… (${signature.slice(0, 12)}…)`);

    // On récupère la tx parsée pour trouver le token acheté par la cible.
    const parsed = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });
    if (!parsed) return;

    const bought = this.detectBoughtMint(parsed, target);
    if (!bought) {
      logger.warn('copy', 'no identifiable bought token in this tx — skipped');
      return;
    }
    incr.detections();

    const st = getState();
    let amountSol = st.copytrade.fixedSol;
    if (st.copytrade.amountMode === 'proportional') {
      const spent = this.solSpentByTarget(parsed, target);
      amountSol = (spent * st.copytrade.proportionalPct) / 100;
      if (amountSol <= 0) amountSol = st.copytrade.fixedSol;
    }

    createOrder({
      engine: 'copytrade',
      outputMint: bought,
      amountSol,
      slippageBps: config.trading.maxSlippageBps, // copy suit le plafond de slippage
      trigger: { kind: 'target', ref: target },
    });
  }

  /** Injecté par le demo feeder : simule la détection d'un achat de `mint`. */
  async simulateDetection(target: string, mint: string) {
    logger.detect('copy', `[demo] simulated swap from ${target.slice(0, 8)}… → ${mint.slice(0, 8)}…`);
    incr.detections();
    const st = getState();
    createOrder({
      engine: 'copytrade',
      outputMint: mint,
      amountSol: st.copytrade.fixedSol,
      slippageBps: config.trading.maxSlippageBps,
      trigger: { kind: 'demo', ref: target },
    });
  }

  /** Cherche un mint dont le solde de la cible a AUGMENTÉ (= acheté). */
  private detectBoughtMint(parsed: any, target: string): string | null {
    const pre: any[] = parsed.meta?.preTokenBalances ?? [];
    const post: any[] = parsed.meta?.postTokenBalances ?? [];
    const key = (b: any) => `${b.owner}:${b.mint}`;
    const preMap = new Map(pre.map((b) => [key(b), Number(b.uiTokenAmount?.amount ?? 0)]));

    let best: { mint: string; delta: number } | null = null;
    for (const b of post) {
      if (b.owner !== target) continue;
      if (IGNORED_MINTS.has(b.mint)) continue;
      const before = preMap.get(key(b)) ?? 0;
      const delta = Number(b.uiTokenAmount?.amount ?? 0) - before;
      if (delta > 0 && (!best || delta > best.delta)) best = { mint: b.mint, delta };
    }
    return best?.mint ?? null;
  }

  /** Estime le SOL dépensé par la cible via le delta de lamports de son compte. */
  private solSpentByTarget(parsed: any, target: string): number {
    const keys: any[] = parsed.transaction?.message?.accountKeys ?? [];
    const idx = keys.findIndex((k) => (k.pubkey?.toString?.() ?? k.toString?.()) === target);
    if (idx < 0) return 0;
    const pre = parsed.meta?.preBalances?.[idx] ?? 0;
    const post = parsed.meta?.postBalances?.[idx] ?? 0;
    const spentLamports = pre - post;
    return spentLamports > 0 ? spentLamports / LAMPORTS_PER_SOL : 0;
  }
}

export const copytrade = new CopyTradeEngine();
