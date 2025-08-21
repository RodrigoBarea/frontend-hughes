"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MenuList from "./menu-list";
import MobileMenu from "./items-menu-mobile";

const H = 120; // altura del header en px (mantiene tu diseño)

const Navbar = () => {
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        setAtTop(y <= 2);

        // lógica: si vamos hacia abajo y pasamos 8px, ocultar; si subimos, mostrar
        if (y > lastY.current && y - lastY.current > 8) {
          setVisible(false);
        } else if (y < lastY.current && lastY.current - y > 8) {
          setVisible(true);
        }
        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed left-0 right-0 z-50 bg-white border-b transition-all duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
        atTop ? "shadow-none" : "shadow-sm",
      ].join(" ")}
      style={{ height: H }}
    >
      {/* contenedor interno */}
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/Logo Transparente.png"
            alt="Hughes Schools"
            width={240}
            height={240}
            priority
            className="h-[110px] w-auto object-contain object-center"
            sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 110px"
          />
        </Link>

        {/* Menú escritorio */}
        <nav className="hidden h-full items-center sm:flex">
          <MenuList />
        </nav>

        {/* Menú móvil */}
        <div className="flex sm:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
