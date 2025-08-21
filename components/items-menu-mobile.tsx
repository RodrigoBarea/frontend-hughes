"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const navItems = [
    { href: "/", label: "Compra" },
    { href: "/", label: "Alquila" },
    { href: "/", label: "En Anticrético" },
    { href: "/", label: "Vende" },
    { href: "/", label: "Nosotros" },
    { href: "/", label: "Blog" },
  ];

  return (
    <div className="sm:hidden">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#1c39bb] focus:outline-none z-50 relative"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed top-0 right-0 w-3/4 h-full bg-white shadow-lg z-50 flex flex-col justify-between"
          >
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-[#1c39bb] mb-1">Menú</h2>

              {navItems.map(({ href, label }) => (
                <motion.div
                  key={label}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  className="relative w-fit"
                >
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="block text-[#1c39bb] font-semibold tracking-wide text-base px-1 py-1"
                  >
                    {label}
                  </Link>
                  <motion.span
                    variants={{
                      rest: { width: 0 },
                      hover: { width: "100%" },
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 bottom-0 h-[2px] bg-[#1c39bb]"
                  />
                </motion.div>
              ))}

              <div className="mt-6 border-t pt-4 border-gray-200">
                <p className="text-sm text-gray-500">¿Necesitas ayuda?</p>
                <a
                  href="https://wa.me/59171122333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#1c39bb] font-semibold text-base mt-2 hover:text-[#25D366] transition"
                >
                  <FaWhatsapp className="text-xl" />
                  +591 711 22 333
                </a>
              </div>
            </div>

            <div className="text-center text-xs text-gray-400 p-4">
              © {new Date().getFullYear()} El Porvenir Bienes Raíces
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenu;
