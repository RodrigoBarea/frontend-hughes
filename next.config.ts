// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autoriza Strapi en dev (localhost:1337) y deja un espacio para prod
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
      // 👉 si tienes un backend público, agrega aquí su dominio:
      // { protocol: "https", hostname: "api.tu-dominio.com", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
