import type { Config } from "tailwindcss";

/**
 * Apple-style monochrome palette via CSS variables (see globals.css :root / .dark).
 * Light: white paper, near-black ink, ink accent. Grays for secondary surfaces.
 * Dark: true-black paper, near-white ink, near-white accent.
 * Semantic tokens — components use paper/surface/ink/line and automatically
 * adapt to light + dark themes. Never hardcode theme-specific colors.
 * Status colors (emerald/amber/red) are semantic and stay as-is.
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
        // Monochrome accent — remapped from electric blue to ink.
        // Keeps the token names so existing classes (bg-electric, text-electric-deep…)
        // resolve to the monochrome accent without touching every file.
        electric: {
          DEFAULT: "#0B0E13",
          soft: "#3A4552",
          pale: "#F1F1F3",
          deep: withAlpha("--electric-deep"),
        },
        night: "#000000",
        ice: "#F5F5F7",
        // Legacy tokens — remapped to theme-aware equivalents. Do not use in new code.
        base: {
          950: withAlpha("--paper"),
          900: withAlpha("--surface"),
          850: withAlpha("--surface"),
          800: withAlpha("--surface-deep"),
          700: withAlpha("--line"),
        },
        accent: {
          DEFAULT: "#0B0E13",
          soft: "#3A4552",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["Satoshi", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-electric": "0 0 24px rgba(11,14,19,0.10), 0 8px 24px rgba(7,11,20,0.12)",
        card: "0 8px 32px rgba(7,11,20,0.08)",
        "card-lg": "0 18px 60px rgba(7,11,20,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
