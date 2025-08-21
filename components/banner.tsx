"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const HS_YELLOW = "#FFBB00";

// Ajusta tiempos aquí
const SLIDE_DURATION_MS = 7000;   // cada cuántos ms cambia
const FADE_SECONDS = 1.2;         // duración del fundido

const IMAGES = [
  { src: "/2.jpg",  alt: "Students celebrating academic achievements" },
  { src: "/10.jpg",  alt: "Students performing arts on stage" },
  { src: "/11.jpg",  alt: "STEM lab activity with students" },
];

export default function BannerPrincipal() {
  const router = useRouter();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % IMAGES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full h-[520px] md:h-[560px] lg:h-[600px] overflow-hidden">
      {/* Capas de imagen: todas posicionadas, opacidad según 'active' */}
      <div className="absolute inset-0">
        {IMAGES.map((img, i) => (
          <motion.div
            key={img.src}
            className="absolute inset-0 will-change-[opacity]"
            initial={false}
            animate={{ opacity: active === i ? 1 : 0 }}
            transition={{ duration: FADE_SECONDS, ease: "easeInOut" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover object-[50%_40%]"
            />
          </motion.div>
        ))}
      </div>

      {/* Gradiente azul para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#110631]/70 via-[#110631]/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#110631]/35 to-transparent" />

      {/* Contenido */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-extrabold leading-tight drop-shadow-xl"
        >
          <span className="block text-white text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl">
            The Art of
          </span>
          <span
            className="block text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl"
            style={{ color: HS_YELLOW }}
          >
            Excellence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-white/90 text-base sm:text-[1.05rem] lg:text-lg 2xl:text-xl max-w-3xl"
        >
          Academic excellence in STEM, performing arts and bilingual education.
        </motion.p>

        {/* CTA: blanco, hover a outline + texto blanco */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/admissions")}
          aria-label="Apply Now"
          className="group relative mt-6 inline-flex h-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#FFBB00] px-7 text-[15px] font-semibold shadow-2xl transition-transform"
        >
          <span className="absolute inset-0 rounded-full bg-white transition-opacity duration-200 group-hover:opacity-0" />
          <span className="relative z-10 transition-colors duration-200 !text-[#110631] group-hover:!text-white">
            Apply Now
          </span>
        </motion.button>
      </div>
    </section>
  );
}
