import { config } from './config.js';
import { bus } from './bus.js';
import type { BotState, Order } from './types.js';

/** État global en mémoire (démo : pas de base de données). */
const state: BotState = {
  wallet: { connectedAddress: null, connectedBalanceSol: null },
  network: config.network,
  copytrade: {
    running: false,
    targets: [],
    amountMode: config.copy.amountMode,
    fixedSol: config.copy.fixedSol,
    proportionalPct: config.copy.proportionalPct,
  },
  sniping: {
    running: false,
    amountSol: config.snipe.amountSol,
    slippageBps: config.snipe.slippageBps,
    maxDelayMs: config.snipe.maxDelayMs,
    programIds: [...config.snipe.programIds],
  },
  stats: { detections: 0, ordersCreated: 0, ordersConfirmed: 0, ordersFailed: 0 },
};

/** File des ordres (démo : bornée en mémoire). */
const orders: Order[] = [];

export function getState(): BotState {
  return state;
}

/** Applique une mutation puis rediffuse l'état complet au frontend. */
export function updateState(fn: (s: BotState) => void): BotState {
  fn(state);
  bus.emitMessage({ type: 'state', payload: state });
  return state;
}

export function addOrder(order: Order) {
  orders.unshift(order);
  if (orders.length > 100) orders.pop();
  bus.emitMessage({ type: 'order', payload: order });
}

/** Émet à nouveau un ordre déjà enregistré (mise à jour de statut). */
export function pushOrder(order: Order) {
  bus.emitMessage({ type: 'order', payload: order });
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getOrders(): Order[] {
  return orders;
}

export const incr = {
  detections: () => updateState((s) => void s.stats.detections++),
  created: () => updateState((s) => void s.stats.ordersCreated++),
  confirmed: () => updateState((s) => void s.stats.ordersConfirmed++),
  failed: () => updateState((s) => void s.stats.ordersFailed++),
};
