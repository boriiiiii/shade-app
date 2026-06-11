/**
 * Tests for lib/phantom.ts
 *
 * Strategy:
 *   - serializeSecret/deserializeSecret: pure round-trip with bs58.
 *   - handlePhantomRedirect: build a real nacl-encrypted redirect payload
 *     (no mocks of nacl itself — we exercise the real crypto path).
 *   - handlePhantomTransactionRedirect: mock @solana/web3.js Connection
 *     so we never hit the network; assert the broadcasted signature is
 *     returned and that error redirects from Phantom are surfaced.
 *
 * The Linking.openURL-based signTransaction() is intentionally NOT tested:
 *   it only triggers a deep-link side effect, no return value to assert.
 */
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';

import {
  deserializeSecret,
  handlePhantomRedirect,
  handlePhantomTransactionRedirect,
  serializeSecret,
} from '@/lib/phantom';

// ---- Mock @solana/web3.js Connection so handlePhantomTransactionRedirect
//      never tries to broadcast to mainnet. ---------------------------------
const mockSendRawTransaction = jest.fn();
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    sendRawTransaction: (...args: any[]) => mockSendRawTransaction(...args),
  })),
}));

beforeEach(() => {
  mockSendRawTransaction.mockReset();
});

// ---- Helpers ---------------------------------------------------------------

/** Mimics how Phantom would encrypt its connect-response payload back to us. */
function buildPhantomConnectRedirect(
  redirectUrl: string,
  dappKeyPair: nacl.BoxKeyPair,
  payload: { public_key: string; session: string }
) {
  const phantomKeyPair = nacl.box.keyPair();
  const sharedSecret = nacl.box.before(dappKeyPair.publicKey, phantomKeyPair.secretKey);
  const nonce = nacl.randomBytes(24);
  const encrypted = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret
  );

  const url = new URL(redirectUrl);
  url.searchParams.set('phantom_encryption_public_key', bs58.encode(phantomKeyPair.publicKey));
  url.searchParams.set('nonce', bs58.encode(nonce));
  url.searchParams.set('data', bs58.encode(encrypted));
  return url.toString();
}

/** Mimics Phantom's signTransaction response containing a signed tx. */
function buildPhantomTxRedirect(
  redirectUrl: string,
  sharedSecret: Uint8Array,
  signedTxBytes: Uint8Array
) {
  const nonce = nacl.randomBytes(24);
  const payload = { transaction: bs58.encode(signedTxBytes) };
  const encrypted = nacl.box.after(Buffer.from(JSON.stringify(payload)), nonce, sharedSecret);

  const url = new URL(redirectUrl);
  url.searchParams.set('nonce', bs58.encode(nonce));
  url.searchParams.set('data', bs58.encode(encrypted));
  return url.toString();
}

// ---- Tests ----------------------------------------------------------------

describe('serializeSecret / deserializeSecret', () => {
  test('round-trip preserves the original Uint8Array', () => {
    const secret = nacl.randomBytes(32);
    const back = deserializeSecret(serializeSecret(secret));
    expect(Buffer.from(back).equals(Buffer.from(secret))).toBe(true);
  });

  test('serializeSecret returns a base58-decodable string', () => {
    const secret = new Uint8Array([1, 2, 3, 4, 5]);
    const encoded = serializeSecret(secret);
    expect(bs58.decode(encoded)).toEqual(secret);
  });
});

describe('handlePhantomRedirect', () => {
  test('decrypts the connect payload and returns { publicKey, session, sharedSecret }', () => {
    const dappKeyPair = nacl.box.keyPair();
    const payload = {
      public_key: 'PhantomPubkey1111111111111111111111111111111',
      session: 'session-token-abc',
    };

    const url = buildPhantomConnectRedirect(
      'shadeapp://?cluster=mainnet',
      dappKeyPair,
      payload
    );

    const result = handlePhantomRedirect(url, dappKeyPair);
    expect(result).not.toBeNull();
    expect(result!.publicKey).toBe(payload.public_key);
    expect(result!.session).toBe(payload.session);
    expect(result!.sharedSecret).toBeInstanceOf(Uint8Array);
    expect(result!.sharedSecret.length).toBe(32);
  });

  test('returns null when phantom params are missing from the URL', () => {
    const dappKeyPair = nacl.box.keyPair();
    const result = handlePhantomRedirect('shadeapp://?something=else', dappKeyPair);
    expect(result).toBeNull();
  });
});

describe('handlePhantomTransactionRedirect', () => {
  test('decrypts the signed tx, broadcasts it, and returns the on-chain signature', async () => {
    // Forge a valid encrypted redirect using a fresh shared secret.
    const dapp = nacl.box.keyPair();
    const phantom = nacl.box.keyPair();
    const sharedSecret = nacl.box.before(phantom.publicKey, dapp.secretKey);

    const fakeSignedTx = new Uint8Array([10, 20, 30, 40]);
    const url = buildPhantomTxRedirect('shadeapp://?phantom_action=onPhantomTx', sharedSecret, fakeSignedTx);

    mockSendRawTransaction.mockResolvedValue('ON_CHAIN_SIG_42');

    const sig = await handlePhantomTransactionRedirect(url, sharedSecret);

    expect(sig).toBe('ON_CHAIN_SIG_42');
    expect(mockSendRawTransaction).toHaveBeenCalledTimes(1);
    // Broadcast got the actual signed bytes back.
    const broadcasted = mockSendRawTransaction.mock.calls[0][0];
    expect(Buffer.from(broadcasted).equals(Buffer.from(fakeSignedTx))).toBe(true);
  });

  test('surfaces Phantom-side errors (errorCode in URL) without broadcasting', async () => {
    const sharedSecret = nacl.randomBytes(32);
    const url = 'shadeapp://?phantom_action=onPhantomTx&errorCode=4001&errorMessage=User%20rejected';

    await expect(handlePhantomTransactionRedirect(url, sharedSecret)).rejects.toThrow(
      /Phantom error 4001/
    );
    expect(mockSendRawTransaction).not.toHaveBeenCalled();
  });

  test('throws on missing payload (no data/nonce)', async () => {
    const sharedSecret = nacl.randomBytes(32);
    const url = 'shadeapp://?phantom_action=onPhantomTx';
    await expect(handlePhantomTransactionRedirect(url, sharedSecret)).rejects.toThrow(
      /Missing transaction data/
    );
    expect(mockSendRawTransaction).not.toHaveBeenCalled();
  });
});
