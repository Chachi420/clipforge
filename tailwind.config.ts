import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0a0f",
          900: "#101016",
          850: "#15151d",
          800: "#1b1b25",
          700: "#262633",
        },
        accent: {
          DEFAULT: "#ff4d2e",
          soft: "#ff6b4a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
