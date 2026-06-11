/**
 * Tests for lib/jupiter.ts
 *
 * Covers the sniping/copytrading quote-building layer used to call Jupiter
 * directly from the client. The backend proxy (lib/api.ts) is tested
 * separately — this file only validates the direct Jupiter contract.
 */
import {
  SOL_MINT,
  getSwapQuote,
  getSwapTransaction,
  getTokenPrice,
  lamportsToSol,
  solToLamports,
} from '@/lib/jupiter';

const LAMPORTS_PER_SOL = 1_000_000_000;

const okJson = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

const errResponse = (status: number, body = 'jupiter error') => ({
  ok: false,
  status,
  json: async () => ({}),
  text: async () => body,
});

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('SOL ↔ lamports conversions', () => {
  test('solToLamports floors to integer (no float drift)', () => {
    expect(solToLamports(1)).toBe(LAMPORTS_PER_SOL);
    expect(solToLamports(0.1)).toBe(100_000_000);
    expect(solToLamports(0.000000001)).toBe(1);
  });

  test('solToLamports floors fractional lamports (no rounding up)', () => {
    // 0.1234567899 SOL → 123456789.9 lamports → floor = 123456789
    expect(solToLamports(0.1234567899)).toBe(123_456_789);
  });

  test('lamportsToSol formats with 6 decimals', () => {
    expect(lamportsToSol(LAMPORTS_PER_SOL)).toBe('1.000000');
    expect(lamportsToSol(123_456_789)).toBe('0.123457');
    expect(lamportsToSol(0)).toBe('0.000000');
  });

  test('round-trip preserves whole-SOL amounts', () => {
    const sol = 2.5;
    expect(parseFloat(lamportsToSol(solToLamports(sol)))).toBeCloseTo(sol, 6);
  });

  test('SOL_MINT exported as expected wrapped SOL address', () => {
    expect(SOL_MINT).toBe('So11111111111111111111111111111111111111112');
  });
});

describe('getSwapQuote (Jupiter direct)', () => {
  test('builds the quote URL with inputMint=SOL and the requested params', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      okJson({ inputMint: SOL_MINT, outputMint: 'USDC', inAmount: '1000', outAmount: '900' })
    );

    await getSwapQuote('USDC', 5_000, 250);

    expect(fetch).toHaveBeenCalledTimes(1);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('inputMint=' + SOL_MINT);
    expect(url).toContain('outputMint=USDC');
    expect(url).toContain('amount=5000');
    expect(url).toContain('slippageBps=250');
  });

  test('uses 300 bps as default slippage', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(okJson({}));
    await getSwapQuote('USDC', 100);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('slippageBps=300');
  });

  test('retries up to 3 times on transient failures then throws', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(errResponse(500, 'boom'))
      .mockResolvedValueOnce(errResponse(502, 'still down'))
      .mockResolvedValueOnce(errResponse(503, 'final'));

    await expect(getSwapQuote('USDC', 100)).rejects.toThrow(/Jupiter quote \(503\)/);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test('recovers on a retry that succeeds', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(errResponse(500, 'flaky'))
      .mockResolvedValueOnce(okJson({ inAmount: '1', outAmount: '2' }));

    const quote = await getSwapQuote('USDC', 100);
    expect(quote.outAmount).toBe('2');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('getSwapTransaction (Jupiter direct)', () => {
  test('posts quote + userPublicKey + wrapAndUnwrapSol=true', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      okJson({ swapTransaction: 'base64-tx' })
    );

    const quote = { inputMint: SOL_MINT, inAmount: '1', outputMint: 'USDC', outAmount: '1', priceImpactPct: '0', routePlan: [] };
    const tx = await getSwapTransaction(quote, 'UserPubkey1111111111111111111111111111111111');

    expect(tx).toBe('base64-tx');
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.quoteResponse).toEqual(quote);
    expect(body.userPublicKey).toBe('UserPubkey1111111111111111111111111111111111');
    expect(body.wrapAndUnwrapSol).toBe(true);
    expect(body.dynamicComputeUnitLimit).toBe(true);
    expect(body.prioritizationFeeLamports).toBe('auto');
  });

  test('throws on 400 quote-rejected by Jupiter', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errResponse(400, 'invalid quote'));
    const quote = { inputMint: SOL_MINT, inAmount: '1', outputMint: 'USDC', outAmount: '1', priceImpactPct: '0', routePlan: [] };

    await expect(
      getSwapTransaction(quote, 'UserPubkey1111111111111111111111111111111111')
    ).rejects.toThrow(/Jupiter swap \(400\)/);
  });
});

describe('getTokenPrice', () => {
  test('returns the price float on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      okJson({ data: { MINT: { price: 1.23 } } })
    );
    const p = await getTokenPrice('MINT');
    expect(p).toBe(1.23);
  });

  test('returns null on non-2xx (graceful)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errResponse(429));
    expect(await getTokenPrice('MINT')).toBeNull();
  });

  test('returns null on network error (no throw)', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('net down'));
    expect(await getTokenPrice('MINT')).toBeNull();
  });
});
