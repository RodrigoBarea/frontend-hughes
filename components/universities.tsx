"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const universities = [
  { name: "Harvard University", logo: "/logos/Harvard.png" },
  { name: "Massachusetts Institute of Technology", logo: "/logos/MIT.png" },
  { name: "Brown University", logo: "/logos/Brown.png" },
  { name: "Penn University", logo: "/logos/Penn.png" },
  { name: "Princeton University", logo: "/logos/princenton.png" },
  { name: "Juilliard School", logo: "/logos/Juillard.png" },
  { name: "Duke University", logo: "/logos/Duke.png" },
  { name: "Columbia University", logo: "/logos/columbia.png" },
  { name: "University of Notre Dame", logo: "/logos/notre-dame.png" },
  { name: "Berklee College of Music", logo: "/logos/berkley.png" },
  { name: "Amherst College", logo: "/logos/Amherest.png" },
  { name: "Vassar College", logo: "/logos/Vassar.png" },
  { name: "College of the Holy Cross", logo: "/logos/holy-cross.png" },
];

export default function UniversityCarousel() {
  const router = useRouter();
  const logos = [...universities, ...universities];

  return (
    <section className="py-16 bg-white overflow-hidden">

      <h2 className="text-center text-2xl md:text-3xl font-bold mb-10 text-hughes-blue">
        Prestigious Universities & Conservatories Accepting Hughes Schools Graduates
      </h2>

      {/* Carrusel */}
      <div className="relative w-full">
        <motion.div
          className="flex gap-20"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 40, // velocidad más lenta
            ease: "linear",
          }}
          style={{ width: "max-content" }}
        >
          {logos.map((uni, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center basis-[320px]"
            >
              <Image
                src={uni.logo}
                alt={uni.name}
                width={280}
                height={120}
                className="object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Texto y botón */}
      <div className="mt-12 text-center max-w-3xl mx-auto px-6">
        <p className="text-base md:text-lg text-[#110631]">
          Our graduates have been accepted to over <strong>26 universities</strong> around the world, 
          showcasing the academic excellence and global reach of Hughes Schools.
        </p>

<motion.button
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => router.push("/academics/graduates")}
  aria-label="See all universities"
  className="group relative mt-6 inline-flex h-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#FFBB00] px-7 text-[15px] font-semibold shadow-2xl transition-transform"
>
  {/* Fondo amarillo al hacer hover */}
  <span className="absolute inset-0 rounded-full bg-[#110631] transition-colors duration-200 group-hover:bg-[#FFBB00]" />
  
  {/* Texto: blanco por defecto, azul al hover */}
  <span className="relative z-10 transition-colors duration-200 text-white group-hover:!text-[#110631]">
    See All
  </span>
</motion.button>

      </div>
    </section>
  );
}
