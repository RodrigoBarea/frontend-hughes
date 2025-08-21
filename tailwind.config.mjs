// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hughes: {
          blue: "#110631",
          yellow: "#FFBB00",
        },
      },
    },
  },
  plugins: [],
};

export default config;
