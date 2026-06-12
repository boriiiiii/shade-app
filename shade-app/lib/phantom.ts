/**
 * Intégration du wallet Phantom via deep links (mobile).
 *
 * Phantom utilise un protocole de "deeplink" chiffré : l'app génère une paire
 * de clés éphémère, ouvre Phantom avec sa clé publique, et Phantom répond via
 * un redirect contenant un payload chiffré (clé publique éphémère + nonce + data).
 * On dérive alors un secret partagé (X25519) pour déchiffrer la réponse.
 *
 * Réf : https://docs.phantom.com/phantom-deeplinks/provider-methods/connect
 */

import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";

const PHANTOM_CONNECT_URL = "https://phantom.app/ul/v1/connect";
const CLUSTER = process.env.EXPO_PUBLIC_SOLANA_CLUSTER || "mainnet-beta";
const APP_URL = process.env.EXPO_PUBLIC_APP_URL || "https://shade.app";

/** Données utiles renvoyées par Phantom après une connexion réussie. */
export interface PhantomConnectData {
  /** Adresse publique Solana de l'utilisateur (base58). */
  publicKey: string;
  /** Jeton de session à réutiliser pour les requêtes suivantes. */
  session: string;
}

/** Décode des octets UTF-8 en chaîne de caractères. */
function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  // Fallback minimal (les payloads Phantom sont du JSON ASCII).
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return decodeURIComponent(escape(result));
}

/**
 * Initie la connexion à Phantom.
 *
 * Génère une paire de clés éphémère, ouvre l'app Phantom via deep link, et
 * retourne la paire de clés : l'appelant la conserve pour pouvoir déchiffrer
 * la réponse reçue dans `handlePhantomRedirect`.
 */
export async function connectPhantom(): Promise<nacl.BoxKeyPair> {
  const dappKeyPair = nacl.box.keyPair();
  const redirectLink = Linking.createURL("onPhantomConnect");

  const query = [
    `dapp_encryption_public_key=${bs58.encode(dappKeyPair.publicKey)}`,
    `cluster=${encodeURIComponent(CLUSTER)}`,
    `app_url=${encodeURIComponent(APP_URL)}`,
    `redirect_link=${encodeURIComponent(redirectLink)}`,
  ].join("&");

  await Linking.openURL(`${PHANTOM_CONNECT_URL}?${query}`);
  return dappKeyPair;
}

/**
 * Traite le redirect renvoyé par Phantom après une demande de connexion.
 *
 * Dérive le secret partagé à partir de la clé publique de Phantom et de la
 * clé privée éphémère de l'app, puis déchiffre le payload.
 *
 * @param url URL complète du redirect reçu.
 * @param dappKeyPair Paire de clés générée par `connectPhantom`.
 * @returns Les données de connexion, ou `null` si le redirect est incomplet.
 * @throws Si le déchiffrement échoue (secret partagé invalide, données altérées).
 */
export function handlePhantomRedirect(
  url: string,
  dappKeyPair: nacl.BoxKeyPair
): PhantomConnectData | null {
  const { queryParams } = Linking.parse(url);
  if (!queryParams) return null;

  const phantomPublicKey = queryParams.phantom_encryption_public_key as string;
  const nonce = queryParams.nonce as string;
  const data = queryParams.data as string;

  if (!phantomPublicKey || !nonce || !data) return null;

  const sharedSecret = nacl.box.before(
    bs58.decode(phantomPublicKey),
    dappKeyPair.secretKey
  );

  const decrypted = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret
  );

  if (!decrypted) {
    throw new Error("Échec du déchiffrement de la réponse Phantom");
  }

  const payload = JSON.parse(bytesToUtf8(decrypted));
  return { publicKey: payload.public_key, session: payload.session };
}
