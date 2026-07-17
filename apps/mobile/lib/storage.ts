import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Native: expo-secure-store (Keychain / Keystore). Web: localStorage fallback
// (expo-secure-store has no web implementation). Keys must match [A-Za-z0-9._-].

const isWeb = Platform.OS === "web";

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return (await SecureStore.getItemAsync(key)) ?? null;
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const secureStorage = { setItem, getItem, removeItem };

// Well-known keys.
export const STORAGE_KEYS = {
  authToken: "shade.auth.token",
  devWalletSecret: "shade.dev.wallet.secret", // dev signer only — never a production user key
  phantomDappSecret: "shade.phantom.dapp.secret",
} as const;

export async function getAuthToken(): Promise<string | null> {
  return getItem(STORAGE_KEYS.authToken);
}
export async function setAuthToken(token: string): Promise<void> {
  await setItem(STORAGE_KEYS.authToken, token);
}
export async function clearAuthToken(): Promise<void> {
  await removeItem(STORAGE_KEYS.authToken);
}
