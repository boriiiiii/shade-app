/**
 * Tests for lib/crypto.ts (balances + address shortening).
 * The balance functions are tested through their swallow-on-error behaviour:
 *   they return '0.0' instead of throwing so the UI stays calm if RPCs flake.
 */
import { getEthBalance, getPolygonBalance, getSolBalance, shortenAddress } from '@/lib/crypto';

describe('shortenAddress', () => {
  test('returns empty string for empty input', () => {
    expect(shortenAddress('')).toBe('');
  });

  test('default 4 chars at each end + "0x" prefix kept', () => {
    expect(shortenAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(
      '0x1234...5678'
    );
  });

  test('custom char count', () => {
    expect(shortenAddress('0x1234567890abcdef1234567890abcdef12345678', 6)).toBe(
      '0x123456...345678'
    );
  });
});

describe('balance fetchers — graceful degradation', () => {
  test('getEthBalance returns "0.0" on RPC failure (does not throw)', async () => {
    const bal = await getEthBalance(
      '0x0000000000000000000000000000000000000000',
      'http://127.0.0.1:1' // unreachable
    );
    expect(bal).toBe('0.0');
  });

  test('getPolygonBalance returns "0.0" on RPC failure', async () => {
    const bal = await getPolygonBalance(
      '0x0000000000000000000000000000000000000000',
      'http://127.0.0.1:1'
    );
    expect(bal).toBe('0.0');
  });

  test('getSolBalance returns "0.0" on invalid address (PublicKey throws → caught)', async () => {
    const bal = await getSolBalance('not-base58', 'http://127.0.0.1:1');
    expect(bal).toBe('0.0');
  });
});
