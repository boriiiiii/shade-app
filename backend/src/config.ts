import 'dotenv/config';

/** Petit helper : lit une variable d'env avec valeur par défaut. */
function env(key: string, fallback = ''): string {
  const v = process.env[key];
  return v === undefined || v === '' ? fallback : v;
}
function envNum(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function envBool(key: string, fallback: boolean): boolean {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  return /^(1|true|yes|on)$/i.test(v.trim());
}

const network = env('SOLANA_NETWORK', 'mainnet-beta');
const heliusKey = env('HELIUS_API_KEY');

/** Dérive les URLs RPC/WS : surcharge manuelle > Helius > RPC public. */
function deriveRpc(): { http: string; ws: string } {
  const httpOverride = env('SOLANA_RPC_URL');
  const wsOverride = env('SOLANA_WS_URL');
  if (httpOverride) {
    return { http: httpOverride, ws: wsOverride || httpOverride.replace(/^http/, 'ws') };
  }
  if (heliusKey) {
    const host = network === 'devnet' ? 'devnet.helius-rpc.com' : 'mainnet.helius-rpc.com';
    return {
      http: `https://${host}/?api-key=${heliusKey}`,
      ws: `wss://${host}/?api-key=${heliusKey}`,
    };
  }
  const host = network === 'devnet' ? 'api.devnet.solana.com' : 'api.mainnet-beta.solana.com';
  return { http: `https://${host}`, ws: `wss://${host}` };
}

const rpc = deriveRpc();

export const config = {
  port: envNum('PORT', 8000),
  corsOrigins: env('CORS_ORIGINS', '*'),

  network,
  rpcUrl: rpc.http,
  wsUrl: rpc.ws,
  explorerCluster: network === 'devnet' ? 'devnet' : undefined, // suffixe ?cluster= pour l'explorer

  jupiter: {
    baseUrl: env('JUPITER_BASE_URL', 'https://lite-api.jup.ag/swap/v1'),
    apiKey: env('JUPITER_API_KEY'),
  },
  inputMint: env('INPUT_MINT', 'So11111111111111111111111111111111111111112'),

  // Plafonds appliqués à la CONSTRUCTION de la tx (l'utilisateur signe ensuite).
  trading: {
    maxTradeSol: envNum('MAX_TRADE_SOL', 0.05),
    maxSlippageBps: envNum('MAX_SLIPPAGE_BPS', 1500),
    priorityFee: env('PRIORITY_FEE_LAMPORTS', 'auto'),
  },

  copy: {
    amountMode: (env('COPY_AMOUNT_MODE', 'fixed') as 'fixed' | 'proportional'),
    fixedSol: envNum('COPY_FIXED_SOL', 0.01),
    proportionalPct: envNum('COPY_PROPORTIONAL_PCT', 100),
  },

  snipe: {
    amountSol: envNum('SNIPE_AMOUNT_SOL', 0.01),
    slippageBps: envNum('SNIPE_SLIPPAGE_BPS', 1500),
    maxDelayMs: envNum('SNIPE_MAX_DELAY_MS', 3000),
    programIds: env('SNIPE_PROGRAM_IDS', '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  demo: {
    feed: envBool('DEMO_FEED', false),
    intervalMs: envNum('DEMO_FEED_INTERVAL_MS', 12000),
  },
} as const;

export type AppConfig = typeof config;
