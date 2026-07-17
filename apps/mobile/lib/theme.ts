// JS-side mirror of the Tailwind palette (tailwind.config.js). Use these where NativeWind
// className cannot reach: navigator theming, StatusBar, RefreshControl tint, vector icons.

export const colors = {
  background: "#0A0E14",
  surface: "#12181F",
  surfaceElevated: "#161D26",
  border: "#232B37",
  borderStrong: "#2E3846",
  textPrimary: "#EAEEF4",
  textSecondary: "#9AA5B4",
  textMuted: "#606A79",
  primary: "#10B981",
  primaryPressed: "#0E9E70",
  danger: "#F0616D",
  warning: "#E7A94E",
  info: "#5E9BEC",
} as const;

// Solana mint constants shared with the backend contract.
export const MINTS = {
  /** wrapped SOL */
  WSOL: "So11111111111111111111111111111111111111112",
  /** System Program id used as a "native SOL" sentinel in order payloads */
  NATIVE_SOL_SENTINEL: "11111111111111111111111111111111",
  /** Circle USDC on devnet */
  USDC_DEVNET: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
} as const;
