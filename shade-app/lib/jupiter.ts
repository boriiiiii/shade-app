import { logger } from '@/lib/logger';

const JUPITER_API = 'https://lite-api.jup.ag/v6';
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: any[];
}

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      logger.warn(`Jupiter attempt ${i + 1} failed`, { message: e?.message });
      if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastError;
};

export const getSwapQuote = async (
  outputMint: string,
  amountLamports: number,
  slippageBps = 300,
): Promise<JupiterQuote> => {
  const params = new URLSearchParams({
    inputMint: SOL_MINT,
    outputMint,
    amount: amountLamports.toString(),
    slippageBps: slippageBps.toString(),
  });
  const url = `${JUPITER_API}/quote?${params}`;
  logger.debug('Jupiter quote request', { url });

  return withRetry(async () => {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Jupiter quote (${res.status}): ${err}`);
    }
    return res.json();
  });
};

export const getSwapTransaction = async (
  quoteResponse: JupiterQuote,
  userPublicKey: string,
): Promise<string> => {
  return withRetry(async () => {
    const res = await fetch(`${JUPITER_API}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Jupiter swap (${res.status}): ${err}`);
    }
    const data = await res.json();
    return data.swapTransaction as string;
  });
};

export const lamportsToSol = (lamports: number): string =>
  (lamports / 1_000_000_000).toFixed(6);

export const solToLamports = (sol: number): number =>
  Math.floor(sol * 1_000_000_000);

export const getTokenPrice = async (mint: string): Promise<number | null> => {
  try {
    const res = await fetch(`https://price.jup.ag/v6/price?ids=${mint}&vsToken=USDC`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[mint]?.price ?? null;
  } catch (e) {
    logger.warn('Failed to fetch token price', { mint });
    return null;
  }
};
