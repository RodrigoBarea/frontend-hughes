"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/** ───────────── Tipos (Strapi v4/v5) ───────────── */
type Media = {
  id?: number | string;
  url?: string;
  alternativeText?: string | null;
  formats?: Record<string, { url: string; width: number; height: number }>;
  attributes?: {
    url?: string;
    alternativeText?: string | null;
    formats?: Record<string, { url: string; width: number; height: number }>;
  };
};

type RowV5 = {
  id: number | string;
  name?: string;
  rol?: string;
  message?: string;
  date?: string;
  photo?: Media[] | Media | null;
};

type RowV4 = {
  id: number | string;
  attributes?: {
    name?: string;
    rol?: string;
    message?: string;
    date?: string;
    photo?: { data?: Media[] | Media | null } | Media[] | Media | null;
  };
};

type Testimonial = RowV4 | RowV5;
type KnownKey = "name" | "rol" | "message" | "date" | "photo";

/** ───────────── Helpers v4/v5 ───────────── */
function getAttr<T = unknown>(row: Testimonial, key: KnownKey): T | undefined {
  const root = row as Record<string, unknown>; // v5
  if (root[key] !== undefined) return root[key] as T;
  const attrs = (row as RowV4).attributes as Record<string, unknown> | undefined; // v4
  if (attrs && attrs[key] !== undefined) return attrs[key] as T;
  return undefined;
}

function getMediaArray(val: unknown): Media[] {
  if (Array.isArray(val)) return val as Media[];
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if ("url" in obj || (obj as { url?: string }).url === undefined) return [obj as Media];
    const d = (obj as { data?: unknown }).data;
    if (Array.isArray(d)) return d as Media[];
    if (d && typeof d === "object") return [d as Media];
  }
  return [];
}

function abs(u?: string | null) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
  return `${base}${u}`;
}

function mediaUrl(m?: Media | null): string | null {
  if (!m) return null;
  const fmts = m.formats ?? m.attributes?.formats;
  const best = fmts?.medium?.url ?? fmts?.small?.url ?? m.url ?? m.attributes?.url ?? null;
  return abs(best);
}

function mediaAlt(m?: Media | null): string | undefined {
  return m?.alternativeText ?? m?.attributes?.alternativeText ?? undefined;
}

/** ───────────── UI utilitarios ───────────── */
function RoleChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
      style={{ borderColor: "#d0d0e0", color: "var(--hs-blue)" }}
    >
      {children}
    </span>
  );
}

function Bubble({
  children,
  featured = false,
  className = "",
}: {
  children: React.ReactNode;
  featured?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`relative rounded-3xl border bg-white shadow-[0_18px_60px_-28px_rgba(17,6,49,0.35)] ${
        featured ? "p-8 md:p-10" : "p-6"
      } ${className}`}
      style={{ borderColor: "#d0d0e0" }}
    >
      {/* cola */}
      <div
        className="absolute -bottom-3 left-10 h-3 w-6 rotate-45 rounded-[6px] border bg-white"
        style={{ borderColor: "#d0d0e0" }}
      />
      {/* comillas marca de agua */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-4 -right-3 h-14 w-14 text-[var(--hs-yellow)]/30"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7 10c1.657 0 3 1.343 3 3 0 1.306-0.835 2.417-2 2.83V18H4v-3c0-2.761 2.239-5 5-5zm10 0c1.657 0 3 1.343 3 3 0 1.306-0.835 2.417-2 2.83V18h-4v-3c0-2.761 2.239-5 5-5z" />
      </svg>
      {children}
    </motion.div>
  );
}

function SeeAllButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border-2 px-10 text-[17px] font-semibold shadow-2xl transition-transform"
      style={{ borderColor: "var(--hs-yellow)" }}
    >
      <span className="absolute inset-0 rounded-full bg-[#110631] transition-colors duration-200 group-hover:bg-[#FFBB00]" />
      <span className="relative z-10 transition-colors duration-200 text-white group-hover:!text-[#110631]">
        See all
      </span>
    </a>
  );
}

/** ───────────── Componente principal ───────────── */
export default function TestimonialsShowcase() {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
        const qs = new URLSearchParams();
        qs.set("populate[photo]", "true");
        qs.set("pagination[pageSize]", "100");
        const res = await fetch(`${base}/api/testimonials?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        const items: Testimonial[] = Array.isArray(json)
          ? (json as Testimonial[])
          : (json as { data?: Testimonial[] }).data ?? [];
        if (!cancelled) setRows(items);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

// 2 al azar
const picks = useMemo(() => {
  const a = [...rows];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, 2);
}, [rows]);


  const seeAllLink = "/testimonials";

  return (
    <section className="relative w-full py-20 bg-[#110631] overflow-hidden">
      {/* decor suave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 30rem at 15% -5%, rgba(255,187,0,0.10), transparent 60%), radial-gradient(60rem 30rem at 85% -10%, rgba(255,255,255,0.06), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* encabezado */}
        <div className="mb-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 tag-hs">Testimonials</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white">
            What our community says
          </h2>
          <p className="text-sm md:text-base mt-2 text-white/80">
            Real voices from students, graduates, and parents.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-stretch">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border bg-white h-60 animate-pulse md:col-span-3"
                  style={{ borderColor: "#d0d0e0" }}
                />
              ))}
            </motion.div>
          ) : error ? (
            <p className="text-center text-white">Error loading testimonials: {error}</p>
          ) : picks.length === 0 ? (
            <p className="text-center text-white">No testimonials yet.</p>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-stretch">
              {picks.map((t, idx) => {
                const name = getAttr<string>(t, "name") ?? "Anonymous";
                const role = getAttr<string>(t, "rol") ?? "";
                const msg = getAttr<string>(t, "message") ?? "";

                const photoRaw = getAttr(t, "photo");
                const photoArr = getMediaArray(photoRaw);
                const photo = photoArr[0] ?? null;
                const avatarUrl = mediaUrl(photo);
                const avatarAlt = mediaAlt(photo) ?? name;

                const featured = idx === 0;

                return (
                  <motion.div key={String(t.id)} className="md:col-span-3 flex">
                    <Bubble
                      featured={featured}
                      className="flex flex-col h-full min-h-[220px] md:min-h-[240px]"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="h-14 w-14 rounded-full overflow-hidden border flex-shrink-0"
                          style={{ borderColor: "#d0d0e0" }}
                        >
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={avatarAlt}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#f1f2f7]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-hughes-blue truncate">{name}</div>
                          {role && (
                            <div className="mt-1">
                              <RoleChip>{role}</RoleChip>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* el párrafo crece para empujar la "cola" al final */}
                      <p className="mt-4 leading-relaxed text-hughes-blue flex-grow">
                        “{msg}”
                      </p>
                    </Bubble>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA final */}
        <div className="mt-10 text-center">
          <SeeAllButton href={seeAllLink} />
        </div>
      </div>
    </section>
  );
}
