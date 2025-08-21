"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

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
  rol?: string;        // Student | Graduate | Parent
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

function normalizeRole(raw?: string | null): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(); // student -> Student
}

/** ───────────── UI Bits ───────────── */

function RoleChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
      style={{ borderColor: "#e6e6f0", color: "var(--hs-blue)" }}
    >
      {children}
    </span>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full rounded-3xl border bg-white p-6 md:p-7 shadow-[0_20px_70px_-35px_rgba(17,6,49,0.35)]"
      style={{ borderColor: "#ececf4" }}
    >
      {children}
    </div>
  );
}

/** ───────────── Encabezado con icono (sin badge) ───────────── */

function HeaderIconOnly({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section
      className="relative w-full py-12 md:py-16 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(70rem 40rem at 100% -10%, rgba(17,6,49,0.06), transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Icono amarillo (comillas) */}
        <div className="inline-flex items-center justify-center">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="#FFBB00" aria-hidden>
            <path d="M7 10c1.657 0 3 1.343 3 3 0 1.306-.835 2.417-2 2.83V18H4v-3c0-2.761 2.239-5 5-5zm10 0c1.657 0 3 1.343 3 3 0 1.306-.835 2.417-2 2.83V18h-4v-3c0-2.761 2.239-5 5-5z" />
          </svg>
        </div>

        <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-hughes-blue">
          {title}
        </h1>
        <p className="text-sm md:text-base mt-2 text-hughes-blue/80">{subtitle}</p>
      </div>
    </section>
  );
}

/** ───────────── Página principal ───────────── */

const PAGE_SIZE = 9;

export default function AllTestimonialsPage() {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro de roles
  const [roleFilter, setRoleFilter] = useState<string>("All");

  // Paginación
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
        const qs = new URLSearchParams();
        qs.set("populate[photo]", "true");
        qs.set("pagination[pageSize]", "300");
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

  // Roles disponibles dinámicamente
  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const val = normalizeRole(getAttr<string>(r, "rol") ?? "");
      if (val) set.add(val);
    });
    const preferred = ["Student", "Graduate", "Parent"];
    const dynamic = Array.from(set);
    dynamic.sort((a, b) => {
      const ai = preferred.indexOf(a);
      const bi = preferred.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return ["All", ...dynamic];
  }, [rows]);

  // Aplicar filtro
  const filteredRows = useMemo(() => {
    if (roleFilter === "All") return rows;
    return rows.filter((r) => normalizeRole(getAttr<string>(r, "rol") ?? "") === roleFilter);
  }, [rows, roleFilter]);

  // Paginación derivada del filtro
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1); // reset al cambiar filtro
  }, [roleFilter]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  return (
    <main className="min-h-screen" style={{ background: "#f9f9fb" }}>
      {/* Header con icono amarillo */}
      <HeaderIconOnly
        title="All Testimonials"
        subtitle="Read what students, graduates, and parents say about Hughes Schools."
      />

      <section className="pb-16" style={{ background: "#f9f9fb" }}>
        <div className="mx-auto max-w-7xl px-4" style={{ background: "#f9f9fb" }}>
          {/* Filtros por rol */}
          <div className="mb-6 flex flex-wrap items-center gap-2 justify-center">
            {availableRoles.map((r) => {
              const active = r === roleFilter;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className="tab-pill rounded-full px-4 py-2 border text-sm transition-colors"
                  style={
                    active
                      ? {
                          background: "var(--hs-yellow)",
                          borderColor: "var(--hs-yellow)",
                          color: "var(--hs-blue)",
                        }
                      : {
                          background: "#ffffff",
                          borderColor: "#e6e6f0",
                          color: "var(--hs-blue)",
                        }
                  }
                >
                  {r}
                </button>
              );
            })}
          </div>

          {/* Grid / Contenido */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-full rounded-3xl border bg-white p-6 animate-pulse"
                  style={{ borderColor: "#ececf4" }}
                >
                  <div className="h-5 w-40 bg-[#ececf4] rounded mb-4" />
                  <div className="h-5 w-24 bg-[#ececf4] rounded mb-4" />
                  <div className="h-24 w-full bg-[#f3f4f8] rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              className="rounded-xl border p-6 text-center text-hughes-blue"
              style={{ borderColor: "var(--hs-yellow)" }}
            >
              Error loading testimonials: {error}
            </div>
          ) : total === 0 ? (
            <p className="text-center text-hughes-blue">No testimonials yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {pageItems.map((t) => {
                  const name = (getAttr<string>(t, "name") ?? "Anonymous") as string;
                  const role = normalizeRole(getAttr<string>(t, "rol") ?? "");
                  const msg = (getAttr<string>(t, "message") ?? "") as string;

                  const photoRaw = getAttr(t, "photo");
                  const photoArr = getMediaArray(photoRaw);
                  const photo = photoArr[0] ?? null;
                  const avatarUrl = mediaUrl(photo);
                  const avatarAlt = mediaAlt(photo) ?? name;

                  return (
                    <CardShell key={String(t.id)}>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="h-12 w-12 rounded-full overflow-hidden border flex-shrink-0"
                          style={{ borderColor: "#ececf4" }}
                        >
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={avatarAlt}
                              width={48}
                              height={48}
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

                      <p className="leading-relaxed text-[15px] text-hughes-blue">“{msg}”</p>
                    </CardShell>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full border px-4 py-2 text-sm tab-pill"
                    style={{
                      background: "var(--hs-yellow)",
                      borderColor: "var(--hs-yellow)",
                      color: "var(--hs-blue)",
                    }}
                    aria-label="Previous page"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const active = p === page;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="rounded-full px-4 py-2 text-sm tab-pill border"
                        style={
                          active
                            ? {
                                background: "var(--hs-yellow)",
                                borderColor: "var(--hs-yellow)",
                                color: "var(--hs-blue)",
                              }
                            : {
                                background: "#ffffff",
                                borderColor: "#e6e6f0",
                                color: "var(--hs-blue)",
                              }
                        }
                        aria-current={active ? "page" : undefined}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-full border px-4 py-2 text-sm tab-pill"
                    style={{
                      background: "var(--hs-yellow)",
                      borderColor: "var(--hs-yellow)",
                      color: "var(--hs-blue)",
                    }}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
