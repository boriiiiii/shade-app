import { DEV_SIGNER_ENABLED } from "../env";
import { devWalletAdapter } from "./devWallet";
import { phantomWalletAdapter } from "./phantomWallet";
import type { WalletAdapter } from "./types";

// Pick the adapter once at module load. The dev signer is only ever selected when the
// bundle is a dev build AND EXPO_PUBLIC_DEV_SIGNER === "true". Production => Phantom.
export const walletAdapter: WalletAdapter = DEV_SIGNER_ENABLED
  ? devWalletAdapter
  : phantomWalletAdapter;

export { resolvePhantomResponse } from "./phantomWallet";
export type { WalletAdapter, WalletKind } from "./types";
