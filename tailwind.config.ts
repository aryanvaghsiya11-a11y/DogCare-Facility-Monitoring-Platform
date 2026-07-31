import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Severity scale — keep these three only. Pair with icon + label, never color alone.
        severity: {
          critical: "#dc2626",
          high: "#ea580c",
          normal: "#16a34a",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
          dark: "#0f172a",
        },
        // Brand — calm emerald/teal for a care facility. Amber reserved for highlights.
        brand: {
          50: "#effdf5",
          100: "#d9f9e8",
          200: "#b5f1d4",
          300: "#7ce4b8",
          400: "#3ecf96",
          500: "#16b57c",
          600: "#0a9363",
          700: "#0a7551",
          800: "#0b5d42",
          900: "#0a4d38",
        },
        accent: {
          50: "#fffbeb",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      borderRadius: {
        card: "0.75rem",
        "card-lg": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        lift: "0 4px 8px rgba(0,0,0,0.05), 0 16px 32px rgba(10,116,99,0.12)",
        glow: "0 0 0 1px rgba(16,181,124,0.2), 0 8px 24px rgba(16,181,124,0.18)",
      },
      // Golden-rule spacing scale used across all three dashboards so visuals don't drift.
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0b5d42 0%, #0a9363 50%, #16b57c 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #ecfdf5 0%, #ecfeff 100%)",
        "hero-grid":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
