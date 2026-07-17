// =============================================================================
//  PHANTOM WALLET — PRODUCTION NON-CUSTODIAL PATH (deep link).
// -----------------------------------------------------------------------------
//  Implements Phantom's "universal link" deep-link protocol
//  (https://docs.phantom.app/phantom-deeplinks). The user's private key stays inside
//  Phantom; Shade only ever receives signatures / signed transactions.
//
//  Flow: we hold an x25519 (nacl.box) "dapp keypair"; `connect` exchanges it with
//  Phantom's key to derive a shared secret; every subsequent request payload is
//  encrypted with that secret, and Phantom's responses are decrypted the same way.
//
//  Responses arrive as an app deep link (shade://phantom/<method>?...). The root layout
//  forwards every incoming URL to `resolvePhantomResponse(url)`, which settles the
//  matching pending request.
//
//  STATUS: structurally complete for connect / signMessage / signTransaction /
//  signAndSendTransaction. Requires a DEV/standalone build registered under the
//  `shade://` scheme + Phantom installed on a real device — it cannot round-trip inside
//  Expo Go (which owns the exp:// scheme). See README "Chemin Phantom".
// =============================================================================
import * as Linking from "expo-linking";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { Buffer } from "buffer";

import { SOLANA_CLUSTER } from "../env";
import { STORAGE_KEYS, secureStorage } from "../storage";
import type { WalletAdapter } from "./types";

const PHANTOM_BASE = "https://phantom.app/ul/v1";
const APP_URL = "https://github.com/"; // metadata shown by Phantom; replace with the real site

type PhantomMethod =
  | "connect"
  | "signMessage"
  | "signTransaction"
  | "signAndSendTransaction";

type BoxKeyPair = { publicKey: Uint8Array; secretKey: Uint8Array };

interface Pending {
  resolve: (params: URLSearchParams) => void;
  reject: (err: Error) => void;
}

const pending: Partial<Record<PhantomMethod, Pending>> = {};

// Session state (in-memory; re-established via connect after a cold start).
let dappKeyPair: BoxKeyPair | null = null;
let sharedSecret: Uint8Array | null = null;
let sessionToken: string | null = null;
let connectedPubkey: string | null = null;

async function getDappKeyPair(): Promise<BoxKeyPair> {
  if (dappKeyPair) return dappKeyPair;
  const stored = await secureStorage.getItem(STORAGE_KEYS.phantomDappSecret);
  if (stored) {
    const secretKey = bs58.decode(stored);
    dappKeyPair = { secretKey, publicKey: nacl.box.keyPair.fromSecretKey(secretKey).publicKey };
    return dappKeyPair;
  }
  const kp = nacl.box.keyPair();
  dappKeyPair = kp;
  await secureStorage.setItem(STORAGE_KEYS.phantomDappSecret, bs58.encode(kp.secretKey));
  return kp;
}

function redirectLink(method: PhantomMethod): string {
  return Linking.createURL(`phantom/${method}`);
}

function encryptPayload(payload: unknown, secret: Uint8Array): {
  nonce: string;
  data: string;
} {
  const nonce = nacl.randomBytes(24);
  const encoded = Uint8Array.from(Buffer.from(JSON.stringify(payload), "utf8"));
  const encrypted = nacl.box.after(encoded, nonce, secret);
  return { nonce: bs58.encode(nonce), data: bs58.encode(encrypted) };
}

function decryptData(dataB58: string, nonceB58: string, secret: Uint8Array): unknown {
  const decrypted = nacl.box.open.after(
    bs58.decode(dataB58),
    bs58.decode(nonceB58),
    secret,
  );
  if (!decrypted) throw new Error("Réponse Phantom illisible (déchiffrement échoué)");
  return JSON.parse(Buffer.from(decrypted).toString("utf8"));
}

function openAndAwait(method: PhantomMethod, url: string): Promise<URLSearchParams> {
  // Reject any stale pending call of the same method.
  pending[method]?.reject(new Error("Requête Phantom remplacée"));
  return new Promise<URLSearchParams>((resolve, reject) => {
    pending[method] = { resolve, reject };
    Linking.openURL(url).catch((err) => {
      delete pending[method];
      reject(new Error(`Impossible d'ouvrir Phantom: ${String(err)}`));
    });
  });
}

/** Called by the root layout for every incoming deep link. Returns true if consumed. */
export function resolvePhantomResponse(url: string): boolean {
  let parsed: Linking.ParsedURL;
  try {
    parsed = Linking.parse(url);
  } catch {
    return false;
  }
  const path = parsed.path ?? "";
  if (!path.startsWith("phantom/")) return false;

  const method = path.slice("phantom/".length) as PhantomMethod;
  const entry = pending[method];
  if (!entry) return true;
  delete pending[method];

  const params = new URLSearchParams(
    Object.entries(parsed.queryParams ?? {}).reduce<Record<string, string>>(
      (acc, [k, v]) => {
        acc[k] = Array.isArray(v) ? (v[0] ?? "") : String(v ?? "");
        return acc;
      },
      {},
    ),
  );

  const errorCode = params.get("errorCode");
  if (errorCode) {
    entry.reject(
      new Error(params.get("errorMessage") || `Phantom a renvoyé une erreur ${errorCode}`),
    );
    return true;
  }
  entry.resolve(params);
  return true;
}

function requireSecret(): Uint8Array {
  if (!sharedSecret || !sessionToken) {
    throw new Error("Wallet Phantom non connecté");
  }
  return sharedSecret;
}

export const phantomWalletAdapter: WalletAdapter = {
  kind: "phantom",
  isDev: false,
  publicKey: null,

  async connect(): Promise<string> {
    const kp = await getDappKeyPair();
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(kp.publicKey),
      cluster: SOLANA_CLUSTER,
      app_url: APP_URL,
      redirect_link: redirectLink("connect"),
    });
    const response = await openAndAwait("connect", `${PHANTOM_BASE}/connect?${params}`);

    const phantomPk = response.get("phantom_encryption_public_key");
    const nonce = response.get("nonce");
    const data = response.get("data");
    if (!phantomPk || !nonce || !data) {
      throw new Error("Réponse connect Phantom incomplète");
    }
    sharedSecret = nacl.box.before(bs58.decode(phantomPk), kp.secretKey);
    const decoded = decryptData(data, nonce, sharedSecret) as {
      public_key: string;
      session: string;
    };
    sessionToken = decoded.session;
    connectedPubkey = decoded.public_key;
    this.publicKey = connectedPubkey;
    return connectedPubkey;
  },

  async disconnect(): Promise<void> {
    sharedSecret = null;
    sessionToken = null;
    connectedPubkey = null;
    this.publicKey = null;
  },

  async signMessage(message: string): Promise<string> {
    const secret = requireSecret();
    const kp = await getDappKeyPair();
    const payload = {
      session: sessionToken,
      message: bs58.encode(Uint8Array.from(Buffer.from(message, "utf8"))),
      display: "utf8",
    };
    const { nonce, data } = encryptPayload(payload, secret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(kp.publicKey),
      nonce,
      redirect_link: redirectLink("signMessage"),
      payload: data,
    });
    const response = await openAndAwait("signMessage", `${PHANTOM_BASE}/signMessage?${params}`);
    const decoded = decryptData(
      response.get("data")!,
      response.get("nonce")!,
      secret,
    ) as { signature: string };
    return decoded.signature; // base58
  },

  async signTransaction(unsignedTxBase64: string): Promise<string> {
    const secret = requireSecret();
    const kp = await getDappKeyPair();
    const txBytes = Uint8Array.from(Buffer.from(unsignedTxBase64, "base64"));
    const payload = { session: sessionToken, transaction: bs58.encode(txBytes) };
    const { nonce, data } = encryptPayload(payload, secret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(kp.publicKey),
      nonce,
      redirect_link: redirectLink("signTransaction"),
      payload: data,
    });
    const response = await openAndAwait(
      "signTransaction",
      `${PHANTOM_BASE}/signTransaction?${params}`,
    );
    const decoded = decryptData(
      response.get("data")!,
      response.get("nonce")!,
      secret,
    ) as { transaction: string };
    // Phantom returns the signed tx base58-encoded; hand it back to the backend as base64.
    return Buffer.from(bs58.decode(decoded.transaction)).toString("base64");
  },

  async signAndSendTransaction(unsignedTxBase64: string): Promise<string> {
    const secret = requireSecret();
    const kp = await getDappKeyPair();
    const txBytes = Uint8Array.from(Buffer.from(unsignedTxBase64, "base64"));
    const payload = { session: sessionToken, transaction: bs58.encode(txBytes) };
    const { nonce, data } = encryptPayload(payload, secret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(kp.publicKey),
      nonce,
      redirect_link: redirectLink("signAndSendTransaction"),
      payload: data,
    });
    const response = await openAndAwait(
      "signAndSendTransaction",
      `${PHANTOM_BASE}/signAndSendTransaction?${params}`,
    );
    const decoded = decryptData(
      response.get("data")!,
      response.get("nonce")!,
      secret,
    ) as { signature: string };
    return decoded.signature; // base58 tx signature
  },
};
