import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#F8FAFC",
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
        },
        accent: {
          DEFAULT: "#F59E0B",
          dark: "#D97706",
        },
        danger: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
        },
        success: {
          DEFAULT: "#22C55E",
          dark: "#15803D",
        },
        surface: {
          DEFAULT: "#0A0A0A",
          hover: "#171717",
          border: "rgba(255, 255, 255, 0.08)",
        },
        muted: {
          DEFAULT: "#94A3B8",
          dark: "#64748B",
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
