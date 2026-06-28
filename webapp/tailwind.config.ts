import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand VisionGarage
        ink: {
          DEFAULT: "#1a3330", // verde închis (temă / fundal logo)
          light: "#244742",
          dark: "#0d1e1c",
        },
        gold: {
          DEFAULT: "#b8922a",
          light: "#d4ae55",
          dark: "#9a7b20",
        },
        cream: "#f4efe4",
        muted: "#8a9b97",
      },
      fontFamily: {
        heading: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(184,146,42,.08), 0 8px 24px -12px rgba(0,0,0,.6)",
      },
    },
  },
  plugins: [],
};

export default config;
