// =============================================================================
//  DEV SIGNER — LOCAL TEST KEY. NOT PART OF THE PRODUCTION TRUST MODEL.
// -----------------------------------------------------------------------------
//  A tweetnacl Ed25519 keypair generated on-device and persisted in secure storage,
//  used ONLY so the full non-custodial flow (login + delegate + trade) can be exercised
//  in Expo Go without a physical phone + Phantom. Guarded by `DEV_SIGNER_ENABLED`
//  (__DEV__ && EXPO_PUBLIC_DEV_SIGNER === "true"). The real product path is Phantom.
//
//  It signs like a real wallet would: Ed25519 over the login message, and legacy Solana
//  transactions signed + broadcast against devnet via @solana/web3.js.
// =============================================================================
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { Buffer } from "buffer";

import { getConnection } from "../solana";
import { STORAGE_KEYS, secureStorage } from "../storage";
import type { WalletAdapter } from "./types";

let _keypair: Keypair | null = null;

/** Load the persisted dev key, generating (and storing) one on first use. */
async function loadOrCreateKeypair(): Promise<Keypair> {
  if (_keypair) return _keypair;

  const stored = await secureStorage.getItem(STORAGE_KEYS.devWalletSecret);
  if (stored) {
    try {
      _keypair = Keypair.fromSecretKey(bs58.decode(stored));
      return _keypair;
    } catch {
      // fall through and regenerate on corruption
    }
  }

  const generated = nacl.sign.keyPair(); // 64-byte secretKey == Solana secret key layout
  _keypair = Keypair.fromSecretKey(generated.secretKey);
  await secureStorage.setItem(
    STORAGE_KEYS.devWalletSecret,
    bs58.encode(generated.secretKey),
  );
  return _keypair;
}

function decodeTx(unsignedTxBase64: string): Transaction {
  return Transaction.from(Buffer.from(unsignedTxBase64, "base64"));
}

export const devWalletAdapter: WalletAdapter = {
  kind: "dev",
  isDev: true,
  publicKey: null,

  async connect(): Promise<string> {
    const kp = await loadOrCreateKeypair();
    this.publicKey = kp.publicKey.toBase58();
    return this.publicKey;
  },

  async disconnect(): Promise<void> {
    // Keep the on-device dev key so the address stays stable across sessions;
    // just drop the in-memory reference / connected flag.
    this.publicKey = null;
  },

  async signMessage(message: string): Promise<string> {
    const kp = await loadOrCreateKeypair();
    const bytes = Uint8Array.from(Buffer.from(message, "utf8"));
    const signature = nacl.sign.detached(bytes, kp.secretKey);
    return bs58.encode(signature);
  },

  async signTransaction(unsignedTxBase64: string): Promise<string> {
    const kp = await loadOrCreateKeypair();
    const tx = decodeTx(unsignedTxBase64);
    tx.sign(kp); // fee payer == owner == this dev key (only required signer)
    return tx.serialize().toString("base64");
  },

  async signAndSendTransaction(unsignedTxBase64: string): Promise<string> {
    const kp = await loadOrCreateKeypair();
    const connection = getConnection();
    const tx = decodeTx(unsignedTxBase64);
    tx.sign(kp);
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  },

  async requestAirdrop(lamports: number): Promise<string> {
    const kp = await loadOrCreateKeypair();
    const connection = getConnection();
    const signature = await connection.requestAirdrop(
      new PublicKey(kp.publicKey),
      lamports,
    );
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  },
};
