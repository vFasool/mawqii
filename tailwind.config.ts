import type { Config } from "tailwindcss";

// Design tokens for "موقعي" — a warm, trustworthy identity for Arabic small-business
// owners: deep emerald for trust/credibility + a souq-inspired amber for energy,
// on a paper-warm (not the generic AI cream/terracotta) background.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F4F7F6",
          100: "#E4EBE9",
          200: "#C3D2CD",
          300: "#93A9A2",
          400: "#5E7A72",
          500: "#3A5850",
          600: "#264038",
          700: "#1B2F29",
          800: "#122019",
          900: "#0D1712",
        },
        emerald: {
          50: "#EAF3F0",
          100: "#CDE3DB",
          200: "#9BC7B7",
          300: "#65A88F",
          400: "#3C8B6C",
          500: "#1F6E4F",
          600: "#155842",
          700: "#114B3F",
          800: "#0C3730",
          900: "#082722",
        },
        amber: {
          50: "#FDF5E7",
          100: "#FAE6C0",
          200: "#F5D191",
          300: "#F0BA61",
          400: "#EEA841",
          500: "#E8942A",
          600: "#C97A1D",
          700: "#9E5F17",
          800: "#744613",
          900: "#4E300E",
        },
        paper: {
          DEFAULT: "#FBFAF5",
          dim: "#F3F1E8",
        },
      },
      fontFamily: {
        display: ["var(--font-el-messiri)", "Tahoma", "sans-serif"],
        body: ["var(--font-plex-arabic)", "Tahoma", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 8px 30px -12px rgba(17, 75, 63, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
