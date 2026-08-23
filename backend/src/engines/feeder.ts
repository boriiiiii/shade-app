import { config } from '../config.js';
import { getState } from '../state.js';
import { logger } from '../logger.js';
import { copytrade } from './copytrade.js';
import { sniping } from './sniping.js';

// Mints mainnet liquides → routables par Jupiter (le quote/swap réussit vraiment).
const DEMO_MINTS = [
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Générateur de faux événements pour la démo : si un moteur tourne, il émet
 * périodiquement une détection synthétique (cible qui trade / nouveau pool),
 * ce qui déclenche un vrai passage dans le pipeline d'exécution.
 */
class DemoFeeder {
  private timer: NodeJS.Timeout | null = null;

  start() {
    if (this.timer) return;
    logger.warn('demo', `feeder ON — simulated events every ${config.demo.intervalMs}ms`);
    this.timer = setInterval(() => this.tick().catch(() => {}), config.demo.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    logger.warn('demo', 'feeder OFF');
  }

  get running() {
    return this.timer !== null;
  }

  private async tick() {
    const st = getState();
    const mint = pick(DEMO_MINTS);
    if (st.sniping.running && Math.random() < 0.5) {
      await sniping.simulateNewPool(mint);
    } else if (st.copytrade.running && st.copytrade.targets.length > 0) {
      await copytrade.simulateDetection(pick(st.copytrade.targets), mint);
    } else if (st.copytrade.running) {
      // Copytrade lancé sans cible : on simule quand même une cible fictive.
      await copytrade.simulateDetection('DemoTarget1111111111111111111111111111111111', mint);
    }
  }
}

export const feeder = new DemoFeeder();
