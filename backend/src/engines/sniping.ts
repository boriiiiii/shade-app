import { PublicKey } from '@solana/web3.js';
import { connection } from '../solana/connection.js';
import { createOrder } from '../orders.js';
import { logger } from '../logger.js';
import { getState, updateState, incr } from '../state.js';

// Marqueurs de logs indiquant la CRÉATION d'un pool / token.
const POOL_INIT_MARKERS = [
  'initialize2', // Raydium AMM v4 (nouvelle pool)
  'init_pc_amount',
  'InitializeMint2', // création de mint (pump.fun & co)
  'Instruction: Create', // pump.fun bonding curve
];

const IGNORED_MINTS = new Set([
  'So11111111111111111111111111111111111111112',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
]);

class SnipeEngine {
  private subs = new Map<string, number>(); // programId -> subscription id
  private seen = new Set<string>();

  async start() {
    const st = getState();
    if (st.sniping.running) return;
    updateState((s) => void (s.sniping.running = true));
    for (const pid of st.sniping.programIds) await this.subscribe(pid);
    logger.ok('snipe', `sniping engine ON — watching ${st.sniping.programIds.length} program(s)`);
  }

  async stop() {
    for (const [pid, id] of this.subs) {
      await connection.removeOnLogsListener(id).catch(() => {});
      logger.sys('snipe', `unsubscribed program ${pid.slice(0, 8)}…`);
    }
    this.subs.clear();
    updateState((s) => void (s.sniping.running = false));
    logger.warn('snipe', 'sniping engine OFF');
  }

  private async subscribe(programId: string) {
    if (this.subs.has(programId)) return;
    const pubkey = new PublicKey(programId);
    const id = connection.onLogs(
      pubkey,
      (l) => {
        if (l.err) return;
        this.onLog(l.signature, l.logs).catch((e) =>
          logger.error('snipe', `log handling: ${e?.message ?? e}`),
        );
      },
      'confirmed',
    );
    this.subs.set(programId, id);
    logger.sys('snipe', `listening to program ${programId.slice(0, 8)}…`);
  }

  private async onLog(signature: string, logs: string[]) {
    const isNewPool = logs.some((line) => POOL_INIT_MARKERS.some((m) => line.includes(m)));
    if (!isNewPool) return;
    if (this.seen.has(signature)) return;
    this.seen.add(signature);
    if (this.seen.size > 2000) this.seen = new Set([...this.seen].slice(-1000));

    const detectedAt = Date.now();
    logger.detect('snipe', `new pool detected (${signature.slice(0, 12)}…)`);

    const parsed = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });
    if (!parsed) return;

    const mint = this.detectNewMint(parsed);
    if (!mint) {
      logger.warn('snipe', 'new pool mint not identified — skipped');
      return;
    }

    const st = getState();
    const elapsed = Date.now() - detectedAt;
    if (elapsed > st.sniping.maxDelayMs) {
      logger.warn('snipe', `delay exceeded (${elapsed}ms > ${st.sniping.maxDelayMs}ms) — snipe aborted`);
      return;
    }
    incr.detections();
    await this.snipe(mint, { kind: 'pool', ref: signature });
  }

  /** Injecté par le demo feeder : simule un nouveau pool `mint`. */
  async simulateNewPool(mint: string) {
    logger.detect('snipe', `[demo] simulated new pool → ${mint.slice(0, 8)}…`);
    incr.detections();
    await this.snipe(mint, { kind: 'demo', ref: 'demo-pool' });
  }

  private async snipe(mint: string, trigger: { kind: 'pool' | 'demo'; ref: string }) {
    const st = getState();
    logger.trade('snipe', `🎯 snipe ${st.sniping.amountSol} SOL on ${mint.slice(0, 8)}…`);
    createOrder({
      engine: 'snipe',
      outputMint: mint,
      amountSol: st.sniping.amountSol,
      slippageBps: st.sniping.slippageBps,
      trigger,
    });
  }

  /** Extrait le mint du nouveau token (premier mint non-SOL/stable référencé). */
  private detectNewMint(parsed: any): string | null {
    const balances: any[] = [
      ...(parsed.meta?.preTokenBalances ?? []),
      ...(parsed.meta?.postTokenBalances ?? []),
    ];
    for (const b of balances) {
      if (b.mint && !IGNORED_MINTS.has(b.mint)) return b.mint;
    }
    return null;
  }
}

export const sniping = new SnipeEngine();
