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
        // Semantic status colors ONLY (brief §13). Never decorative.
        // Desaturated variants in dark mode via CSS vars (see globals.css).
        status: {
          success: withAlpha("--status-success"),
          warning: withAlpha("--status-warning"),
          error: withAlpha("--status-error"),
        },
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
      // Brief §13 type scale: 12/14/16/18/24/30/36/48 come from Tailwind
      // defaults (text-xs → text-5xl). Display sizes 64+ added here.
      fontSize: {
        d64: ["4rem", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        d80: ["5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        d96: ["6rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      // Brief §13 radius: 6px small elements, 10px cards, full pills.
      borderRadius: {
        sm: "6px",
        card: "10px",
      },
      // Brief §13 motion: 150ms micro, 250ms transitions, ease-out-expo.
      transitionDuration: {
        micro: "150ms",
        DEFAULT: "250ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.25, 1, 0.5, 1)",
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
