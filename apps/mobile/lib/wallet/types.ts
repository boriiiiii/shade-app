// The single abstraction every screen talks to. Two implementations exist:
//   - devWalletAdapter    (tweetnacl local key, DEV ONLY, broadcasts on devnet)
//   - phantomWalletAdapter (Phantom deep link, production non-custodial path)
//
// The app NEVER holds a production user's private key. In prod the key stays in Phantom.

export type WalletKind = "dev" | "phantom";

export interface WalletAdapter {
  readonly kind: WalletKind;
  /** True only for the dev signer. Drives the visible "DEV SIGNER" badge. */
  readonly isDev: boolean;

  /** base58 public key once connected, else null. */
  publicKey: string | null;

  /** Connect the wallet and return the base58 public key. */
  connect(): Promise<string>;

  /** Forget the current session (does not destroy any on-device dev key). */
  disconnect(): Promise<void>;

  /**
   * Sign an arbitrary UTF-8 message (login proof).
   * Returns the base58 encoding of the 64-byte Ed25519 signature.
   */
  signMessage(message: string): Promise<string>;

  /**
   * Sign an unsigned transaction (base64) WITHOUT broadcasting it.
   * Returns the signed transaction as base64 — used for POST /orders/{id}/submit,
   * where the backend performs the broadcast.
   */
  signTransaction(unsignedTxBase64: string): Promise<string>;

  /**
   * Sign an unsigned transaction (base64) AND broadcast it on-chain.
   * Returns the transaction signature (base58). Used for delegation Approve / Revoke,
   * which have no backend broadcast endpoint (the backend only records the signature).
   */
  signAndSendTransaction(unsignedTxBase64: string): Promise<string>;

  /**
   * Dev-only convenience: request a devnet airdrop to fund the local test key.
   * Undefined on adapters that cannot self-fund (Phantom).
   */
  requestAirdrop?(lamports: number): Promise<string>;
}
