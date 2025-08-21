"use client";

import * as React from "react";
import Link from "next/link";
import { UsersRound, User2, LogOut } from "lucide-react";

type Student = { id: number; firstName?: string; lastName?: string; code?: string };
type ParentMe = { parent: { id: number; fullName?: string; email?: string; students?: Student[] } };

// Puedes definir las CSS vars en :root (globals.css) -> --hs-blue, --hs-yellow
const BRAND = { blue: "var(--hs-blue)", yellow: "var(--hs-yellow)" };

export default function ParentsNavbar() {
  const [me, setMe] = React.useState<ParentMe | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        if (r.ok) {
          const data: ParentMe = await r.json();
          if (mounted) setMe(data);
        }
      } catch {}
      finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const students = me?.parent?.students ?? [];
  const parentName = me?.parent?.fullName || me?.parent?.email || "";

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Izquierda: título / branding */}
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-md"
            style={{ background: BRAND.yellow }}
            aria-hidden
          />
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: BRAND.blue }}>
              Hughes Schools
            </p>
            <h1 className="text-sm font-bold" style={{ color: BRAND.blue }}>
              Portal de Padres de Familia
            </h1>
          </div>
        </div>

        {/* Derecha: estudiantes + parent */}
        <div className="flex items-center gap-3">
          {/* Chips de estudiantes (scroll horizontal en móvil) */}
          <div className="flex max-w-[50vw] items-center gap-2 overflow-x-auto md:max-w-none">
            {loading && (
              <span className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
            )}
            {!loading && students.length === 0 && (
              <span
                className="rounded-full border px-3 py-1 text-xs font-semibold bg-white"
                style={{ borderColor: "#e6e6f0", color: BRAND.blue }}
              >
                Sin estudiantes
              </span>
            )}
            {!loading &&
              students.map((s) => {
                const name = [s.firstName, s.lastName].filter(Boolean).join(" ") || `Estudiante #${s.id}`;
                return (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold bg-white"
                    style={{ borderColor: "#e6e6f0", color: BRAND.blue }}
                    title={s.code ? `Código: ${s.code}` : undefined}
                  >
                    <UsersRound size={12} />
                    {name}
                  </span>
                );
              })}
          </div>

          {/* Separador sutil */}
          <span className="mx-1 hidden h-5 w-px bg-slate-200 md:block" aria-hidden />

          {/* Nombre del padre/madre */}
          <div
            className="hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold bg-white md:inline-flex"
            style={{ borderColor: "#e6e6f0", color: BRAND.blue }}
            title="Padre/Madre/Apoderado"
          >
            <User2 size={12} />
            {loading ? "Cargando…" : parentName || "No identificado"}
          </div>

          {/* Logout opcional (usa tu /api/auth/logout) */}
          <form action="/api/auth/logout" method="post" className="hidden md:block">
{/* Logout */}
<button
  onClick={async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      // Redirige a la página de login siempre
      window.location.href = "parents/login";
    }
  }}
  className="hidden md:inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition hover:shadow"
  style={{ background: "#fff", borderColor: "#e6e6f0", color: BRAND.blue }}
  title="Salir"
>
  <LogOut size={12} />
  Salir
</button>

          </form>
          {/* En móvil, podrías mover este botón dentro de un menú si prefieres */}
        </div>
      </div>
    </nav>
  );
}
