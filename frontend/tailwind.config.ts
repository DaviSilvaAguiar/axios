import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0052ff",
          hover: "#578bfa",
          link: "#0667d0",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0a0b0d",
          card: "#282b31",
          muted: "#eef0f3",
          subtle: "rgba(247, 247, 247, 0.88)",
        },
        ink: {
          DEFAULT: "#0a0b0d",
          muted: "#5b616e",
        },
        border: "rgba(91, 97, 110, 0.2)",
      },
      borderRadius: {
        pill: "56px",
      },
      fontFamily: {
        display: ["CoinbaseDisplay", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        ui: ["CoinbaseSans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["CoinbaseText", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
