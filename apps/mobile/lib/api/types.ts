// TypeScript mirror of the FastAPI schemas (services/api/app/**/schemas.py).
// Datetime fields arrive as ISO-8601 strings.

export type ExecutionMode = "manual" | "degen" | "full_trust";
export type OrderStatus =
  | "draft"
  | "ready_to_sign"
  | "pending"
  | "success"
  | "failed"
  | "rejected"
  | "cancelled";
export type OrderSide = "buy" | "sell";
export type OrderSource = "manual" | "copytrade" | "snipe";
export type DelegationStatus = "pending" | "active" | "revoked" | "expired";

// ---- Auth ----
export interface User {
  id: string;
  wallet_address: string;
  chain: string;
  subscription_tier: string;
  preferences: Record<string, unknown>;
}

export interface NonceResponse {
  wallet_address: string;
  nonce: string;
  message: string;
  expires_at: string;
}

export interface VerifyRequest {
  wallet_address: string;
  nonce: string;
  signature: string; // base58 of the Ed25519 signature of `message`
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: User;
}

// ---- Wallet / delegation ----
export interface SideWallet {
  pubkey: string;
  balance_lamports: number;
  network: string;
}

export interface PrepareDelegationRequest {
  mode: Extract<ExecutionMode, "degen" | "full_trust">;
  mint?: string;
  amount: number; // base units (lamports for wSOL)
  duration_seconds: number;
  wrap_sol?: boolean;
}

export interface PreparedDelegation {
  delegation_id: string;
  unsigned_tx: string; // base64
  token_account: string;
  delegate: string;
  mint: string;
  amount: number;
  mode: string;
  status: string;
  expires_at: string;
}

export interface Delegation {
  id: string;
  mode: string;
  token_mint: string;
  token_account: string;
  delegate_pubkey: string;
  amount_max: number;
  amount_spent: number;
  duration_seconds: number;
  expires_at: string;
  status: DelegationStatus;
  approve_tx_sig: string | null;
  revoke_tx_sig: string | null;
}

export interface RevokePrepared {
  delegation_id: string;
  unsigned_tx: string; // base64 Revoke tx to broadcast on-chain
  token_account: string;
  status: string;
}

// ---- Orders ----
export interface PrepareOrderRequest {
  mode: ExecutionMode;
  side?: OrderSide;
  input_mint: string;
  output_mint: string;
  input_amount: number;
  slippage_bps?: number;
  quoted_output_amount?: number;
  source?: OrderSource;
  source_ref?: string;
  delegation_id?: string;
  whitelist?: string[];
}

export interface Order {
  id: string;
  mode: string;
  status: OrderStatus;
  side: string;
  source: string;
  source_ref: string | null;
  input_mint: string;
  output_mint: string;
  input_amount: number;
  min_output_amount: number | null;
  quoted_output_amount: number | null;
  slippage_bps: number;
  route: Record<string, unknown> | null;
  delegation_id: string | null;
  unsigned_tx: string | null;
  tx_signature: string | null;
  failure_reason: string | null;
  realized_pnl: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderList {
  orders: Order[];
  aggregate_pnl: number;
  success_count: number;
  failed_count: number;
}

// ---- Copytrade ----
export interface Trader {
  id: string;
  wallet_address: string;
  label: string;
  stats: Record<string, unknown>;
}

export interface CopyConfigRequest {
  trader_id: string;
  position_size: number;
  max_budget: number;
  slippage_bps?: number;
  token_whitelist: string[];
  frequency_seconds?: number;
  delegation_id?: string | null;
  enabled: boolean;
}

export interface CopyConfig {
  id: string;
  trader_id: string;
  position_size: number;
  max_budget: number;
  slippage_bps: number;
  token_whitelist: string[];
  frequency_seconds: number;
  delegation_id: string | null;
  enabled: boolean;
}

// ---- Sniping ----
export interface SnipeConfigRequest {
  max_position: number;
  slippage_bps?: number;
  max_latency_ms?: number;
  risk_limits?: Record<string, unknown>;
  token_whitelist: string[];
  delegation_id?: string | null;
  enabled: boolean;
}

export interface SnipeConfig {
  id: string;
  max_position: number;
  slippage_bps: number;
  max_latency_ms: number;
  risk_limits: Record<string, unknown>;
  token_whitelist: string[];
  delegation_id: string | null;
  enabled: boolean;
}

export interface SnipeEventRequest {
  mint: string;
  pool?: string;
  detected_latency_ms?: number;
}
