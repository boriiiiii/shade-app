// Centralised access to EXPO_PUBLIC_* runtime config. These are inlined at build time by Expo.

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export const API_URL = rawApiUrl.replace(/\/+$/, ""); // strip trailing slashes

export const SOLANA_CLUSTER = (process.env.EXPO_PUBLIC_SOLANA_CLUSTER ??
  "devnet") as "devnet" | "testnet" | "mainnet-beta";

// The dev signer is a NON-CUSTODIAL-EXEMPT convenience: a local test key that never ships to
// production. It is only ever honoured when the bundle is a dev build AND the flag is on.
export const DEV_SIGNER_ENABLED =
  __DEV__ && process.env.EXPO_PUBLIC_DEV_SIGNER === "true";
