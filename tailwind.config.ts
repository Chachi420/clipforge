import type { Config } from "tailwindcss";

/**
 * Vectr-inspired theme-aware palette via CSS variables (see globals.css :root / .dark).
 * Light: pale ice-blue paper, near-black ink, electric blue accent.
 * Dark: deep navy-black paper, ice-blue ink, electric blue accent.
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
        electric: {
          DEFAULT: "#2047FF",
          soft: "#5B7CFF",
          pale: "#E3E9FF",
          deep: withAlpha("--electric-deep"),
        },
        night: "#070B14",
        ice: "#D8E5ED",
        // Legacy tokens — remapped to theme-aware equivalents. Do not use in new code.
        base: {
          950: withAlpha("--paper"),
          900: withAlpha("--surface"),
          850: withAlpha("--surface"),
          800: withAlpha("--surface-deep"),
          700: withAlpha("--line"),
        },
        accent: {
          DEFAULT: "#2047FF",
          soft: "#5B7CFF",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-electric": "0 0 44px rgba(32,71,255,0.35), 0 10px 36px rgba(7,11,20,0.16)",
        card: "0 8px 32px rgba(7,11,20,0.08)",
        "card-lg": "0 18px 60px rgba(7,11,20,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
