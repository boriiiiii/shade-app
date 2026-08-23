// Types partagés côté backend. Le frontend a une copie miroir simplifiée.
// Modèle 100% non-custodial : le backend ne détient aucune clé. Il détecte des
// opportunités et construit des transactions NON signées pour le wallet connecté.
// Chaque ordre est signé/envoyé par l'utilisateur dans Phantom.

export type LogLevel = 'info' | 'ok' | 'warn' | 'error' | 'detect' | 'trade' | 'sys';

export interface LogEntry {
  id: string;
  ts: number; // epoch ms
  level: LogLevel;
  source: string;
  message: string;
  data?: Record<string, unknown>;
}

// Cycle de vie d'un ordre :
//  pending    → détecté / demandé, en attente d'approbation utilisateur
//  building   → construction de la tx Jupiter en cours
//  awaiting   → tx construite, en attente de signature dans Phantom
//  sent       → signée & broadcastée (signature connue)
//  confirmed  → confirmée on-chain
//  failed     → échec (build / confirm)
//  rejected   → refusée par l'utilisateur
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
  wallet: string; // wallet connecté qui signera
  inputMint: string;
  outputMint: string;
  amountSol: number;
  slippageBps: number;
  // rempli à la construction
  expectedOut?: string;
  priceImpactPct?: number;
  txBase64?: string; // tx non signée (versioned), à signer dans Phantom
  // rempli après signature
  signature?: string;
  explorerUrl?: string;
  error?: string;
  trigger?: { kind: 'target' | 'pool' | 'demo'; ref: string };
}

export interface BotState {
  wallet: {
    // Le SEUL wallet : le compte Phantom connecté (qui trade et signe).
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

// Messages poussés sur le WebSocket vers le frontend
export type WsMessage =
  | { type: 'hello'; payload: { state: BotState; recentLogs: LogEntry[]; orders: Order[] } }
  | { type: 'log'; payload: LogEntry }
  | { type: 'state'; payload: BotState }
  | { type: 'order'; payload: Order };
