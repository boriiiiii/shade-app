import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { api } from "../api/client";
import type { User } from "../api/types";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../storage";
import { walletAdapter } from "../wallet";
import type { WalletAdapter } from "../wallet";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  walletAddress: string | null;
  adapter: WalletAdapter;
  isDevSigner: boolean;
  /** Full non-custodial login: connect -> nonce -> signMessage -> verify -> store JWT. */
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const adapter = useRef(walletAdapter).current;

  // Restore an existing session on cold start.
  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getAuthToken();
      if (!token) {
        if (active) setStatus("unauthenticated");
        return;
      }
      api.setToken(token);
      try {
        const me = await api.me();
        if (!active) return;
        setUser(me);
        setWalletAddress(me.wallet_address);
        setStatus("authenticated");
      } catch {
        // token invalid / revoked / backend down -> require a fresh login
        api.setToken(null);
        await clearAuthToken();
        if (active) setStatus("unauthenticated");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async () => {
    // 1) Connect the wallet and obtain the public key.
    const pubkey = await adapter.connect();
    // 2) Ask the backend for a nonce + the exact message to sign.
    const nonce = await api.requestNonce(pubkey);
    // 3) Sign the message inside the wallet (base58 Ed25519 signature).
    const signature = await adapter.signMessage(nonce.message);
    // 4) Verify -> JWT + user.
    const res = await api.verify({
      wallet_address: pubkey,
      nonce: nonce.nonce,
      signature,
    });
    await setAuthToken(res.access_token);
    api.setToken(res.access_token);
    setUser(res.user);
    setWalletAddress(res.user.wallet_address);
    setStatus("authenticated");
  }, [adapter]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // best-effort server-side revocation; local teardown proceeds regardless
    }
    api.setToken(null);
    await clearAuthToken();
    await adapter.disconnect();
    setUser(null);
    setWalletAddress(null);
    setStatus("unauthenticated");
  }, [adapter]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
      setWalletAddress(me.wallet_address);
    } catch {
      // ignore — surfaced by whatever triggered the refresh
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      walletAddress,
      adapter,
      isDevSigner: adapter.isDev,
      login,
      logout,
      refreshUser,
    }),
    [status, user, walletAddress, adapter, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
