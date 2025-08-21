// tailwind.config.ts
import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hs: {
          blue: "#110631",   // HS_BLUE
          yellow: "#FFBB00", // HS_YELLOW
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
