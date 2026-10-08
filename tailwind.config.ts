import type { Config } from "tailwindcss";

/**
 * Theme-aware palette via CSS variables (see globals.css :root / .dark).
 * Semantic tokens — components use paper/surface/ink/line and automatically
 * adapt to light + dark themes. Never hardcode theme-specific colors.
 */
const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: withAlpha("--paper"),
        surface: withAlpha("--surface"),
        "surface-deep": withAlpha("--surface-deep"),
        ink: {
          DEFAULT: withAlpha("--ink"),
          soft: withAlpha("--ink-soft"),
          faint: withAlpha("--ink-faint"),
        },
        line: withAlpha("--line"),
        lime: {
          DEFAULT: "#BFFF3C",
          soft: "#D9FF70",
          pale: "#EFFFD2",
          deep: withAlpha("--lime-deep"),
        },
        night: "#0B0F0C",
        // Legacy tokens — remapped to theme-aware equivalents. Do not use in new code.
        base: {
          950: withAlpha("--paper"),
          900: withAlpha("--surface"),
          850: withAlpha("--surface"),
          800: withAlpha("--surface-deep"),
          700: withAlpha("--line"),
        },
        accent: {
          DEFAULT: "#4D7C0F",
          soft: "#BFFF3C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-lime": "0 0 44px rgba(191,255,60,0.45), 0 10px 36px rgba(16,21,16,0.16)",
        card: "0 8px 32px rgba(16,21,16,0.08)",
        "card-lg": "0 18px 60px rgba(16,21,16,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
