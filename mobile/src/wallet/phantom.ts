import * as Linking from 'expo-linking';
import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Hermes fournit atob à l'exécution (RN ≥ 0.74) ; on le déclare pour TS.
declare function atob(data: string): string;

/**
 * Connexion Phantom + signature de transactions via deep links chiffrés.
 * https://docs.phantom.com/phantom-deeplinks
 *
 * Modèle 100% non-custodial : le backend construit des transactions non signées
 * pour le wallet connecté ; CHAQUE transaction est signée & envoyée ici par
 * l'utilisateur dans Phantom (signAndSendTransaction).
 */

let dappKeyPair: nacl.BoxKeyPair | null = null; // paire éphémère (connexion)
let sharedSecret: Uint8Array | null = null; // secret partagé avec Phantom
let phantomSession: string | null = null; // token de session Phantom
let dappPublicKeyB58: string | null = null; // notre clé publique de chiffrement

function ensureKeyPair(): nacl.BoxKeyPair {
  if (!dappKeyPair) {
    const seed = Crypto.getRandomBytes(32);
    dappKeyPair = nacl.box.keyPair.fromSecretKey(Uint8Array.from(seed));
  }
  return dappKeyPair;
}

// --- petits helpers d'encodage (payloads ASCII : base58 + session) ---
function utf8(s: string): Uint8Array {
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
function fromUtf8(b: Uint8Array): string {
  return String.fromCharCode(...Array.from(b));
}
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function q(o: Record<string, string>): string {
  return Object.entries(o)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
}

export interface PhantomSessionData {
  dappPublicKey: string; // b58
  sharedSecret: string; // b58
  session: string;
}

/** Restaure la session (après un rechargement de l'app) pour pouvoir re-signer. */
export function restorePhantomSession(s: PhantomSessionData) {
  dappPublicKeyB58 = s.dappPublicKey;
  sharedSecret = bs58.decode(s.sharedSecret);
  phantomSession = s.session;
}

export function clearPhantomSession() {
  sharedSecret = null;
  phantomSession = null;
  dappPublicKeyB58 = null;
}

// ---------------- CONNEXION ----------------
export async function startPhantomConnect(cluster = 'mainnet-beta'): Promise<void> {
  const kp = ensureKeyPair();
  const redirect = Linking.createURL('phantom');
  const url = `https://phantom.app/ul/v1/connect?${q({
    dapp_encryption_public_key: bs58.encode(kp.publicKey),
    cluster,
    app_url: 'https://shade.demo',
    redirect_link: redirect,
  })}`;
  await Linking.openURL(url);
}

// ---------------- SIGNATURE D'UNE TX ----------------
/**
 * Ouvre Phantom pour SIGNER une transaction (base64 depuis Jupiter). Phantom
 * renvoie la tx signée via le deep link ; c'est ensuite le backend qui la
 * broadcast. (signAndSendTransaction est déprécié par Phantom → on utilise
 * signTransaction.)
 */
export async function signTransaction(txBase64: string): Promise<void> {
  if (!sharedSecret || !phantomSession || !dappPublicKeyB58) {
    throw new Error('Phantom not connected (reconnect first)');
  }
  const payload = {
    session: phantomSession,
    transaction: bs58.encode(b64ToBytes(txBase64)),
  };
  const nonce = Crypto.getRandomBytes(24);
  const encrypted = nacl.box.after(utf8(JSON.stringify(payload)), nonce, sharedSecret);
  const redirect = Linking.createURL('phantom');
  const url = `https://phantom.app/ul/v1/signTransaction?${q({
    dapp_encryption_public_key: dappPublicKeyB58,
    nonce: bs58.encode(nonce),
    redirect_link: redirect,
    payload: bs58.encode(encrypted),
  })}`;
  await Linking.openURL(url);
}

// ---------------- TRAITEMENT DES RETOURS PHANTOM ----------------
export type PhantomResult =
  | { kind: 'connect'; publicKey: string; session: PhantomSessionData }
  | { kind: 'sign'; signedTx: string } // tx signée (base58) à broadcaster
  | null;

/**
 * Traite une URL de retour Phantom. Distingue une réponse de connexion
 * (contient phantom_encryption_public_key) d'une réponse de signature (data+nonce).
 */
export function handlePhantomRedirect(url: string): PhantomResult {
  const { queryParams } = Linking.parse(url);
  if (!queryParams) return null;

  if (queryParams.errorCode || queryParams.errorMessage) {
    throw new Error(String(queryParams.errorMessage ?? 'Phantom request rejected'));
  }

  const data = queryParams.data ? String(queryParams.data) : null;
  const nonce = queryParams.nonce ? String(queryParams.nonce) : null;
  const phantomPub = queryParams.phantom_encryption_public_key
    ? String(queryParams.phantom_encryption_public_key)
    : null;

  // --- Réponse de CONNEXION ---
  if (phantomPub && data && nonce) {
    const kp = ensureKeyPair();
    const secret = nacl.box.before(bs58.decode(phantomPub), kp.secretKey);
    const decrypted = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), secret);
    if (!decrypted) throw new Error('cannot decrypt Phantom connect payload');
    const parsed = JSON.parse(fromUtf8(decrypted)) as { public_key: string; session: string };

    // On mémorise la session pour les signatures suivantes.
    sharedSecret = secret;
    phantomSession = parsed.session;
    dappPublicKeyB58 = bs58.encode(kp.publicKey);

    return {
      kind: 'connect',
      publicKey: parsed.public_key,
      session: {
        dappPublicKey: dappPublicKeyB58,
        sharedSecret: bs58.encode(secret),
        session: parsed.session,
      },
    };
  }

  // --- Réponse de SIGNATURE (tx signée) ---
  if (data && nonce) {
    if (!sharedSecret) throw new Error('Phantom session missing (reconnect)');
    const decrypted = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
    if (!decrypted) throw new Error('cannot decrypt Phantom sign payload');
    const parsed = JSON.parse(fromUtf8(decrypted)) as { transaction: string };
    return { kind: 'sign', signedTx: parsed.transaction };
  }

  return null;
}
