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
