
// next.config.ts
//import type { NextConfig } from "next";

//const nextConfig: NextConfig = {
  //images: {
    // Autoriza Strapi en dev (localhost:1337) y deja un espacio para prod
    //remotePatterns: [
     // { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
      // 👉 si tienes un backend público, agrega aquí su dominio:
      // { protocol: "https", hostname: "api.tu-dominio.com", pathname: "/uploads/**" },
   // ],
 // },
//};

//export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'back-hughes-1.onrender.com',
        pathname: '/uploads/**', // todo el bucket local de Strapi
      },
      // si en algún momento usas http durante pruebas locales:
      { protocol: 'http', hostname: 'back-hughes-1.onrender.com', pathname: '/uploads/**' },
      // y si algún día cambias a Cloudinary u otro host, añádelo aquí
      // { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    // o, alternativamente:
    // domains: ['back-hughes-1.onrender.com'],
  },
};

module.exports = nextConfig;
