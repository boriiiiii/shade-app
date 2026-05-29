/**
 * Configuration et fonctions API
 */

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export interface ApiData {
  hello: string;
  supabase_configured: boolean;
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  wallet_type: "phantom" | "evm";
  created_at: string;
}

export interface WalletAuthResponse {
  user: UserProfile;
  is_new: boolean;
}

export async function getApiStatus(): Promise<ApiData> {
  const response = await fetch(`${API_URL}/`);
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function authWithWallet(
  walletAddress: string,
  walletType: "phantom" | "evm"
): Promise<WalletAuthResponse> {
  const response = await fetch(`${API_URL}/auth/wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress, wallet_type: walletType }),
  });
  if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
  return response.json();
}

export interface SolanaSignatureInfo {
  signature: string;
  blockTime: number | null;
  err: any;
}

export async function getSolanaSignatures(address: string, limit = 20): Promise<SolanaSignatureInfo[]> {
  const response = await fetch(`${API_URL}/solana/signatures/${address}?limit=${limit}`);
  if (!response.ok) throw new Error(`Signatures fetch failed: ${response.status}`);
  const data = await response.json();
  return data.signatures;
}

export async function getSolanaTransaction(signature: string): Promise<any> {
  const response = await fetch(`${API_URL}/solana/transaction/${signature}`);
  if (!response.ok) throw new Error(`Transaction fetch failed: ${response.status}`);
  const data = await response.json();
  return data.transaction;
}

export async function getSwapTransactionViaBackend(
  outputMint: string,
  amountLamports: number,
  userPublicKey: string,
  slippageBps = 300,
): Promise<{ swapTransaction: string; quote: any }> {
  const response = await fetch(`${API_URL}/swap/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      output_mint: outputMint,
      amount_lamports: amountLamports,
      user_public_key: userPublicKey,
      slippage_bps: slippageBps,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Swap failed: ${err}`);
  }
  const data = await response.json();
  return { swapTransaction: data.swap_transaction, quote: data.quote };
}
