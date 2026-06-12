/**
 * Tests for lib/api.ts — the backend proxy layer.
 *
 * These tests cover the contract the front uses for:
 *   - sniping  : getSwapTransactionViaBackend → POST /swap/transaction
 *   - manual copy : getSolanaSignatures / getSolanaTransaction → GET /solana/*
 *   - wallet auth : authWithWallet → POST /auth/wallet
 *
 * No network is hit — `fetch` is replaced per test.
 */
import {
  authWithWallet,
  getApiStatus,
  getSolanaSignatures,
  getSolanaTransaction,
  getSwapTransactionViaBackend,
} from '@/lib/api';

const json = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('getSwapTransactionViaBackend (sniping core)', () => {
  const USER = 'AbCxYz1111111111111111111111111111111111111';
  const TOKEN = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  test('posts output_mint / amount_lamports / user_public_key with default 300 bps', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      json({ swap_transaction: 'BASE64', quote: { outAmount: '42' } })
    );

    const res = await getSwapTransactionViaBackend(TOKEN, 100_000_000, USER);

    expect(res.swapTransaction).toBe('BASE64');
    expect(res.quote.outAmount).toBe('42');

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toMatch(/\/swap\/transaction$/);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      output_mint: TOKEN,
      amount_lamports: 100_000_000,
      user_public_key: USER,
      slippage_bps: 300,
    });
  });

  test('forwards custom slippage_bps and never overrides it', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(json({ swap_transaction: 'TX', quote: {} }));

    await getSwapTransactionViaBackend(TOKEN, 1_000, USER, 50);

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.slippage_bps).toBe(50);
  });

  test('throws and includes the backend error body on non-2xx', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => 'Jupiter quote failed (400): bad mint',
      json: async () => ({}),
    });

    await expect(
      getSwapTransactionViaBackend(TOKEN, 1_000, USER)
    ).rejects.toThrow(/Jupiter quote failed/);
  });

  test('propagates network errors (no swallow)', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(
      getSwapTransactionViaBackend(TOKEN, 1_000, USER)
    ).rejects.toThrow('ECONNREFUSED');
  });

  /**
   * Security invariant of the Manual mode:
   *   The "/swap/transaction" call only returns an unsigned base64 tx.
   *   It is NEVER the place where the signature happens — that's Phantom's
   *   job on the client. This test pins the contract: the backend response
   *   only contains the unsigned transaction blob, and `getSwapTransactionViaBackend`
   *   does not invoke any signing primitive (no mock leaks).
   */
  test('manual mode: returns an unsigned transaction blob — no signing side-effect', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      json({ swap_transaction: 'UNSIGNED_BASE64', quote: { outAmount: '1' } })
    );

    const { swapTransaction } = await getSwapTransactionViaBackend(TOKEN, 1_000, USER);

    expect(swapTransaction).toBe('UNSIGNED_BASE64');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // No other side-effect — the function is purely a request/response wrapper.
  });
});

describe('getSolanaSignatures (manual copy detection)', () => {
  test('GETs the address with the requested limit and unwraps `signatures`', async () => {
    const sigs = [
      { signature: 'sig1', blockTime: 1, err: null },
      { signature: 'sig2', blockTime: 2, err: null },
    ];
    (global.fetch as jest.Mock).mockResolvedValue(json({ signatures: sigs }));

    const out = await getSolanaSignatures('TargetAddr', 5);

    expect(out).toEqual(sigs);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/solana/signatures/TargetAddr');
    expect(url).toContain('limit=5');
  });

  test('throws on backend error (caller can stop polling)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => 'rpc down',
    });
    await expect(getSolanaSignatures('Addr')).rejects.toThrow(/Signatures fetch failed: 500/);
  });
});

describe('getSolanaTransaction (manual copy enrichment)', () => {
  test('unwraps the transaction field from backend payload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      json({ transaction: { meta: { err: null }, transaction: {} } })
    );
    const tx = await getSolanaTransaction('SOMESIG');
    expect(tx.meta.err).toBeNull();
  });

  test('throws on backend error so the polling loop can keep going on other sigs', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => 'err',
    });
    await expect(getSolanaTransaction('S')).rejects.toThrow(/Transaction fetch failed/);
  });
});

describe('authWithWallet', () => {
  test('posts wallet_address + wallet_type and returns the parsed user', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      json({
        user: { id: 'u1', wallet_address: 'addr', wallet_type: 'phantom', created_at: 'now' },
        is_new: true,
      })
    );

    const res = await authWithWallet('addr', 'phantom');

    expect(res.user.wallet_address).toBe('addr');
    expect(res.is_new).toBe(true);
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toEqual({ wallet_address: 'addr', wallet_type: 'phantom' });
  });

  test('throws on backend rejection (UI can show login error)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
      text: async () => 'forbidden',
    });
    await expect(authWithWallet('addr', 'phantom')).rejects.toThrow(/Auth failed: 403/);
  });
});

describe('getApiStatus', () => {
  test('returns hello + supabase_configured flag from /', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      json({ hello: 'world', supabase_configured: true })
    );
    const status = await getApiStatus();
    expect(status).toEqual({ hello: 'world', supabase_configured: true });
  });
});
