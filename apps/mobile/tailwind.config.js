/** @type {import('tailwindcss').Config} */
// Sober "trust-first" fintech palette: dark ink background, a single emerald accent,
// generous spacing, soft radii. Keep this in sync with lib/theme.ts (JS-side mirror).
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0E14",
        surface: "#12181F",
        "surface-2": "#161D26",
        border: "#232B37",
        "border-strong": "#2E3846",
        content: {
          DEFAULT: "#EAEEF4",
          secondary: "#9AA5B4",
          muted: "#606A79",
        },
        primary: {
          DEFAULT: "#10B981",
          pressed: "#0E9E70",
          soft: "rgba(16,185,129,0.12)",
        },
        danger: {
          DEFAULT: "#F0616D",
          soft: "rgba(240,97,109,0.12)",
        },
        warning: {
          DEFAULT: "#E7A94E",
          soft: "rgba(231,169,78,0.12)",
        },
        info: {
          DEFAULT: "#5E9BEC",
          soft: "rgba(94,155,236,0.12)",
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
