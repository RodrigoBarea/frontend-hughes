"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/** Brand colors */
const BRAND = {
  blue: "var(--hs-blue)",
  yellow: "var(--hs-yellow)",
};

type Item = { label: string; href?: string; newTab?: boolean; onClick?: () => void };
type Group = { label: string; items: Item[] };

const GROUPS: Group[] = [
  {
    label: "Academics",
    items: [
      { label: "Academic Programs", href: "/academics/programs" },
      { label: "Our Learning Environment", href: "/academics/learning-env" },
      { label: "Where Our Graduates Go", href: "/academics/graduates" },
      { label: "Why choose Hughes Schools?", href: "/academics/undergraduate" },
      { label: "Student Testimonials", href: "/testimonials" },
      { label: "Academic Staff", href: "/academics/academic-staff" },
      { label: "Student Portal (Login)", href: "/academics/login", newTab: true },
    ],
  },
  {
    label: "Performing Arts",
    items: [
      { label: "Art Programs", href: "/arts/artprograms" },
      { label: "Art Staff", href: "/arts/art-staff" },
    ],
  },
  {
    label: "Events",
    items: [
      { label: "Events Recap", href: "/events" },
      { label: "Events Calendar", href: "/events/calendar" },
    ],
  },
];

const SINGLES: Item[] = [
  { label: "Admissions", href: "/admissions" },
  { label: "News", href: "/news" },
  { label: "Donation", href: "/donation" },
  { label: "About us", href: "/about" },
  { label: "FAQS", href: "/faqs" },
  { label: "Parents", href: "/parents/login", newTab: true },
  { label: "Contact" }, // se completará con onClick
  { label: "Resources", href: "/resources" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null); // acordeón

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleContact = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      const el = document.getElementById("footer");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  const singlesWithActions = SINGLES.map((it) =>
    it.label === "Contact" ? { ...it, onClick: handleContact } : it
  );

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label)); // abre uno a la vez
  };

  const underline = (
    <motion.span
      variants={{ rest: { width: 0 }, hover: { width: "100%" } }}
      transition={{ duration: 0.25 }}
      className="absolute left-0 bottom-0 h-[2px]"
      style={{ backgroundColor: BRAND.yellow }}
    />
  );

  return (
    <div className="sm:hidden">
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="text-[color:var(--hs-blue)] focus:outline-none z-50 relative"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="fixed top-0 right-0 w-[86vw] max-w-sm h-[100dvh] bg-white shadow-2xl z-50 flex flex-col"
            aria-label="Mobile navigation"
          >
            {/* Header del drawer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <span className="text-lg font-extrabold" style={{ color: BRAND.blue }}>
                Menu
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Grupos desplegables */}
              <div className="space-y-2">
                {GROUPS.map((group) => {
                  const expanded = openGroup === group.label;
                  return (
                    <div key={group.label} className="border-b border-gray-100 pb-2">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        aria-expanded={expanded}
                        aria-controls={`group-${group.label}`}
                        className="flex w-full items-center justify-between py-2"
                        style={{ color: BRAND.blue }}
                      >
                        <span className="text-base font-bold">{group.label}</span>
                        <motion.span
                          animate={{ rotate: expanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm"
                        >
                          ▸
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.ul
                            id={`group-${group.label}`}
                            key={`${group.label}-list`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="pl-2"
                          >
                            {group.items.map((item) => (
                              <li key={`${group.label}-${item.label}`} className="py-1">
                                <motion.div initial="rest" whileHover="hover" className="relative w-fit">
                                  <Link
                                    href={item.href ?? "#"}
                                    target={item.newTab ? "_blank" : undefined}
                                    rel={item.newTab ? "noopener noreferrer" : undefined}
                                    onClick={() => setIsOpen(false)}
                                    className="block font-semibold tracking-wide text-[15px] px-1 py-1"
                                    style={{ color: BRAND.blue }}
                                  >
                                    {item.label}
                                  </Link>
                                  {underline}
                                </motion.div>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Enlaces simples */}
              <div className="space-y-2 pt-2">
                {singlesWithActions.map((item) => (
                  <motion.div key={item.label} initial="rest" whileHover="hover" className="relative w-fit">
                    {item.href ? (
                      <Link
                        href={item.href}
                        target={item.newTab ? "_blank" : undefined}
                        rel={item.newTab ? "noopener noreferrer" : undefined}
                        onClick={() => setIsOpen(false)}
                        className="block font-semibold tracking-wide text-base px-1 py-1"
                        style={{ color: BRAND.blue }}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className="font-semibold tracking-wide text-base px-1 py-1"
                        style={{ color: BRAND.blue }}
                      >
                        {item.label}
                      </button>
                    )}
                    {underline}
                  </motion.div>
                ))}
              </div>

              {/* Ayuda / WhatsApp (opcional) */}
              <div className="mt-4 border-t pt-3 border-gray-200">
                <p className="text-sm text-gray-500">¿Necesitas ayuda?</p>
                <a
                  href="https://wa.me/59171122333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-semibold text-base mt-2 transition"
                  style={{ color: BRAND.blue }}
                >
                  <FaWhatsapp className="text-xl" />
                  +591 711 22 333
                </a>
              </div>
            </div>

            {/* Footer del drawer */}
            <div className="text-center text-[11px] text-gray-400 p-4 border-t border-gray-200">
              © {new Date().getFullYear()} Hughes Schools
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
