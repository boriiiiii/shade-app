import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PhantomSessionData } from './phantom';

/** Wallet Phantom connecté (affichage). */
export interface ConnectedWallet {
  address: string;
  balanceSol: number | null;
}

const WALLET_KEY = 'shade.wallet';
const PHANTOM_KEY = 'shade.phantom'; // secret partagé + session (pour re-signer)

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
async function set(key: string, val: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* best-effort */
  }
}
async function del(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* best-effort */
  }
}

export const loadWallet = () => get<ConnectedWallet>(WALLET_KEY);
export const saveWallet = (w: ConnectedWallet) => set(WALLET_KEY, w);
export const loadPhantom = () => get<PhantomSessionData>(PHANTOM_KEY);
export const savePhantom = (p: PhantomSessionData) => set(PHANTOM_KEY, p);

export async function clearSession(): Promise<void> {
  await del(WALLET_KEY);
  await del(PHANTOM_KEY);
}
