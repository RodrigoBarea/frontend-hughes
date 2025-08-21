"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, FileText, Users } from "lucide-react";

const BRAND = { blue: "var(--hs-blue)", yellow: "var(--hs-yellow)" };

const links = [
  { href: "/help-center", label: "Inicio", icon: Home },
  { href: "/help-center/timetables", label: "Horarios", icon: Calendar },
  { href: "/help-center/forms", label: "Formularios", icon: FileText },
];

export default function ParentsPortalNav() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white border-b sticky top-0 z-40">
      <div className="mx-auto max-w-7xl h-[68px] px-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Users size={22} style={{ color: BRAND.blue }} />
          <span className="font-semibold text-hughes-blue">Parent Portal</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition"
                style={{
                  background: active ? BRAND.yellow : "#fff",
                  border: `1px solid ${active ? BRAND.yellow : "#e6e6f0"}`,
                  color: BRAND.blue,
                }}
              >
                <Icon size={16} />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
