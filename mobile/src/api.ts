import { API_URL } from './config';
import type { BotState, Order } from './types';

async function req<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const url = `${API_URL}/api${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`backend unreachable → ${url}`);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as any)?.error ?? `HTTP ${res.status}`);
  return json as T;
}

export const api = {
  health: async (): Promise<{ ok: boolean; network?: string; url: string }> => {
    const url = `${API_URL}/health`;
    try {
      const res = await fetch(url);
      const j = await res.json();
      return { ok: !!j.ok, network: j.network, url };
    } catch {
      return { ok: false, url };
    }
  },

  state: () => req<{ state: BotState; orders: Order[]; config: any }>('/state'),

  // Wallet connecté (seul wallet)
  connect: (address: string) =>
    req<{ address: string; balanceSol: number }>('/wallet/connect', 'POST', { address }),
  disconnect: () => req('/wallet/disconnect', 'POST'),
  refresh: () => req<{ connectedBalanceSol: number | null }>('/wallet/refresh'),

  // Copytrade
  copyStart: () => req('/copytrade/start', 'POST'),
  copyStop: () => req('/copytrade/stop', 'POST'),
  copyAdd: (address: string) => req('/copytrade/targets', 'POST', { address }),
  copyRemove: (address: string) => req(`/copytrade/targets/${address}`, 'DELETE'),
  copyConfig: (cfg: Partial<{ amountMode: string; fixedSol: number; proportionalPct: number }>) =>
    req('/copytrade/config', 'POST', cfg),

  // Sniping
  snipeStart: () => req('/sniping/start', 'POST'),
  snipeStop: () => req('/sniping/stop', 'POST'),
  snipeConfig: (cfg: Partial<{ amountSol: number; slippageBps: number; maxDelayMs: number; programIds: string[] }>) =>
    req('/sniping/config', 'POST', cfg),

  // Ordres (chaque tx est signée par l'utilisateur dans Phantom)
  createOrder: (outputMint: string, amountSol: number, slippageBps?: number) =>
    req<{ order: Order }>('/orders', 'POST', { outputMint, amountSol, slippageBps }),
  buildOrder: (id: string) => req<{ order: Order }>(`/orders/${id}/build`, 'POST'),
  submitSigned: (id: string, signedTx: string) =>
    req<{ order: Order }>(`/orders/${id}/submit`, 'POST', { signedTx }),
  rejectOrder: (id: string) => req<{ order: Order }>(`/orders/${id}/reject`, 'POST'),

  // Demo
  demoFeed: (on: boolean) => req<{ running: boolean }>('/demo/feed', 'POST', { on }),
  demoTrigger: (engine: 'copy' | 'snipe', mint?: string) =>
    req('/demo/trigger', 'POST', { engine, mint }),
};
