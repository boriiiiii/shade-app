// Miroir simplifié des types backend (voir backend/src/types.ts).

export type LogLevel = 'info' | 'ok' | 'warn' | 'error' | 'detect' | 'trade' | 'sys';

export interface LogEntry {
  id: string;
  ts: number;
  level: LogLevel;
  source: string;
  message: string;
  data?: Record<string, unknown>;
}

export type OrderStatus =
  | 'pending'
  | 'building'
  | 'awaiting'
  | 'sent'
  | 'confirmed'
  | 'failed'
  | 'rejected';

export interface Order {
  id: string;
  ts: number;
  engine: 'copytrade' | 'snipe' | 'manual';
  status: OrderStatus;
  wallet: string;
  inputMint: string;
  outputMint: string;
  amountSol: number;
  slippageBps: number;
  expectedOut?: string;
  priceImpactPct?: number;
  txBase64?: string;
  signature?: string;
  explorerUrl?: string;
  error?: string;
  trigger?: { kind: 'target' | 'pool' | 'demo'; ref: string };
}

export interface BotState {
  wallet: {
    connectedAddress: string | null;
    connectedBalanceSol: number | null;
  };
  network: string;
  copytrade: {
    running: boolean;
    targets: string[];
    amountMode: 'fixed' | 'proportional';
    fixedSol: number;
    proportionalPct: number;
  };
  sniping: {
    running: boolean;
    amountSol: number;
    slippageBps: number;
    maxDelayMs: number;
    programIds: string[];
  };
  stats: {
    detections: number;
    ordersCreated: number;
    ordersConfirmed: number;
    ordersFailed: number;
  };
}

export type WsMessage =
  | { type: 'hello'; payload: { state: BotState; recentLogs: LogEntry[]; orders: Order[] } }
  | { type: 'log'; payload: LogEntry }
  | { type: 'state'; payload: BotState }
  | { type: 'order'; payload: Order };
