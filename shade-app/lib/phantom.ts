import 'react-native-get-random-values';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import * as Linking from 'expo-linking';
import nacl from 'tweetnacl';
import { Connection } from '@solana/web3.js';

const buildUrl = (path: string, params: Record<string, any>) => {
    const url = new URL(`https://phantom.app/ul/v1/${path}`);
    Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key]);
    });
    return url.toString();
};

const decryptPayload = (data: string, nonce: string, sharedSecret: Uint8Array) => {
    if (!data || !nonce || !sharedSecret) throw new Error('Missing data for decryption');
    const encryptedData = bs58.decode(data);
    const nonceBuffer = bs58.decode(nonce);
    const decrypted = nacl.box.open.after(encryptedData, nonceBuffer, sharedSecret);
    if (!decrypted) throw new Error('Decryption failed');
    return JSON.parse(Buffer.from(decrypted).toString('utf8'));
};

const encryptPayload = (payload: any, sharedSecret: Uint8Array) => {
    if (!payload || !sharedSecret) throw new Error('Missing data for encryption');
    const nonce = nacl.randomBytes(24);
    const payloadBuffer = Buffer.from(JSON.stringify(payload));
    const encrypted = nacl.box.after(payloadBuffer, nonce, sharedSecret);
    return [bs58.encode(nonce), bs58.encode(encrypted)];
};

// Serialization helpers pour AsyncStorage (Uint8Array ↔ string)
export const serializeSecret = (secret: Uint8Array): string => bs58.encode(secret);
export const deserializeSecret = (encoded: string): Uint8Array => bs58.decode(encoded);

// RPC pour broadcaster les transactions signées
const SOL_RPC = 'https://api.mainnet-beta.solana.com';

export const connectPhantom = async () => {
    const dappKeyPair = nacl.box.keyPair();
    const params = {
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        cluster: 'mainnet-beta',
        app_url: 'https://shade.app',
        redirect_link: Linking.createURL(''),
    };
    const url = buildUrl('connect', params);
    Linking.openURL(url);
    return dappKeyPair;
};

export const handlePhantomRedirect = (url: string, dappKeyPair: nacl.BoxKeyPair) => {
    const parsedUrl = new URL(url);
    const phantomPublicKey = parsedUrl.searchParams.get('phantom_encryption_public_key');
    const data = parsedUrl.searchParams.get('data');
    const nonce = parsedUrl.searchParams.get('nonce');

    if (phantomPublicKey && data && nonce) {
        const sharedSecret = nacl.box.before(
            bs58.decode(phantomPublicKey),
            dappKeyPair.secretKey
        );
        const connectData = decryptPayload(data, nonce, sharedSecret);
        return {
            publicKey: connectData.public_key as string,
            session: connectData.session as string,
            sharedSecret,
        };
    }
    return null;
};

/**
 * Ouvre Phantom pour signer une transaction (sans l'envoyer).
 * Phantom a déprécié signAndSendTransaction — on utilise signTransaction
 * puis on broadcast nous-mêmes via sendRawTransaction.
 *
 * @param serializedTx - Transaction sérialisée en base64 (format Jupiter/Solana)
 * @param session - Session token récupéré lors du connect
 * @param sharedSecret - Clé partagée nacl
 * @param dappPublicKey - Clé publique dapp (base58 string ou Uint8Array)
 * @param redirectPath - Path du deep link de retour (défaut: 'onPhantomTx')
 */
export const signTransaction = (
    serializedTx: string,
    session: string,
    sharedSecret: Uint8Array,
    dappPublicKey: Uint8Array | string,
    redirectPath = 'onPhantomTx',
) => {
    // On utilise l'URL de base + query param pour éviter "unmatched route" d'Expo Router
    // shadeapp://?phantom_action=onPhantomTx au lieu de shadeapp://onPhantomTx
    // Jupiter renvoie du base64, Phantom attend du base58
    const txBytes = Buffer.from(serializedTx, 'base64');
    const txBase58 = bs58.encode(txBytes);

    const payload = { session, transaction: txBase58 };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const pubKeyBytes = typeof dappPublicKey === 'string'
        ? bs58.decode(dappPublicKey)
        : dappPublicKey;

    const url = buildUrl('signTransaction', {
        dapp_encryption_public_key: bs58.encode(pubKeyBytes),
        nonce,
        redirect_link: Linking.createURL('', { queryParams: { phantom_action: redirectPath } }),
        payload: encryptedPayload,
    });
    Linking.openURL(url);
};

// Kept as alias for backward compatibility during migration
export const signAndSendTransaction = signTransaction;

/**
 * Déchiffre la réponse Phantom après signature d'une transaction.
 * Retourne la transaction signée (base58) et la broadcast sur le réseau.
 * Retourne la signature de la transaction broadcastée.
 */
export const handlePhantomTransactionRedirect = async (
    url: string,
    sharedSecret: Uint8Array,
): Promise<string> => {
    const parsedUrl = new URL(url);
    const errorCode = parsedUrl.searchParams.get('errorCode');
    if (errorCode) {
        const msg = parsedUrl.searchParams.get('errorMessage') || 'Unknown error';
        throw new Error(`Phantom error ${errorCode}: ${decodeURIComponent(msg)}`);
    }
    const data = parsedUrl.searchParams.get('data');
    const nonce = parsedUrl.searchParams.get('nonce');
    if (!data || !nonce) throw new Error('Missing transaction data in redirect');

    const decrypted = decryptPayload(data, nonce, sharedSecret);

    // signTransaction retourne { transaction: "base58-encoded-signed-tx" }
    const signedTxBase58: string = decrypted.transaction;
    if (!signedTxBase58) {
        // Fallback: si pour une raison le format renvoie une signature directement
        return decrypted.signature as string;
    }

    // Decode et broadcast
    const signedTxBytes = bs58.decode(signedTxBase58);
    const connection = new Connection(SOL_RPC, 'confirmed');
    const signature = await connection.sendRawTransaction(Buffer.from(signedTxBytes), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
    });

    return signature;
};
