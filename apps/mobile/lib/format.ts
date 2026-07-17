import { SOLANA_CLUSTER } from "./env";

export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Convert lamports to a fixed-decimals SOL string (no unit). */
export function lamportsToSol(
  lamports: number | null | undefined,
  decimals = 4,
): string {
  if (lamports == null || Number.isNaN(lamports)) return (0).toFixed(decimals);
  return (lamports / LAMPORTS_PER_SOL).toFixed(decimals);
}

/** Convert a SOL amount (may be fractional) to integer lamports. */
export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

/** "1.2340 SOL" */
export function formatSol(
  lamports: number | null | undefined,
  decimals = 4,
): string {
  return `${lamportsToSol(lamports, decimals)} SOL`;
}

/** Signed lamports rendered as SOL, with an explicit +/- prefix (for PnL). */
export function formatSignedSol(
  lamports: number | null | undefined,
  decimals = 4,
): string {
  const value = lamports ?? 0;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${lamportsToSol(Math.abs(value), decimals)} SOL`;
}

/** "A1b2…Yz90" */
export function truncateAddress(
  address?: string | null,
  lead = 4,
  tail = 4,
): string {
  if (!address) return "—";
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${SOLANA_CLUSTER}`;
}

/** Parse a comma / whitespace separated list of mints into a clean array. */
export function parseWhitelist(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

/** Human "in 2h 3m" / "expired" relative to now for a future ISO timestamp. */
export function formatRelativeExpiry(iso?: string | null): string {
  if (!iso) return "—";
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return iso;
  const deltaMs = target - Date.now();
  if (deltaMs <= 0) return "expirée";
  const mins = Math.floor(deltaMs / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `dans ${days}j ${hours % 24}h`;
  if (hours > 0) return `dans ${hours}h ${mins % 60}m`;
  return `dans ${mins}m`;
}
