// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // 👈 nuevo plugin v4
    // autoprefixer ya no es necesario; si lo quieres, puedes añadirlo:
    // autoprefixer: {},
  },
};

export default config;
