/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "satoshi": ["Satoshi", "sans-serif"],
        "satoshi-light": ["Satoshi", "sans-serif"],
        "satoshi-regular": ["Satoshi", "sans-serif"], 
        "satoshi-medium": ["Satoshi", "sans-serif"],
        "satoshi-bold": ["Satoshi", "sans-serif"],
        "satoshi-black": ["Satoshi", "sans-serif"],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        bold: '700',
        extrabold: '900',
      },
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        cards: "var(--color-cards)",
        padding: "var(--color-padding)",
        validation: "var(--color-validation)",
        invalidation: "var(--color-invalidation)",
        novalidation: "var(--color-novalidation)",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        background: {
          DEFAULT: "var(--color-background)",
        },
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "app-h": "var(--app-padding-horizontal)",
        "app-v": "var(--app-padding-vertical)",
        "app-top": "var(--app-padding-top)",
      },
      height: {
        "wallet-btn": "60px",
      },
      width: {
        "wallet-icon": "28px",
      },
      margin: {
        "wallet-btn": "12px",
      },
      padding: {
        "wallet-btn-h": "24px",
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
      },
      borderRadius: {
        sm: "var(--border-radius-sm)",
        md: "var(--border-radius-md)",
        lg: "var(--border-radius-lg)",
        xl: "var(--border-radius-xl)",
      },
    },
  },
  plugins: [],
};
