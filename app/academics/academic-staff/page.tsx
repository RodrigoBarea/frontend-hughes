"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

/**********************
 * Types (Strapi v4/v5)
 **********************/

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

type SubjectV5 = { id: number | string; name?: string };

type SubjectV4 = {
  id: number | string;
  attributes?: { name?: string };
};

type RowV5 = {
  id: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  foto?: Media[] | Media | null;
  staff?: string;
  subjects?: SubjectV5[] | SubjectV5 | null;
};

type RowV4 = {
  id: number | string;
  attributes?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    staff?: string;
    foto?: { data?: Media[] | Media | null } | Media[] | Media | null;
    subjects?: { data?: SubjectV4[] | SubjectV4 | null } | SubjectV4[] | SubjectV4 | null;
  };
};

type Teacher = RowV4 | RowV5;

type KnownKey =
  | "firstName"
  | "lastName"
  | "email"
  | "staff"
  | "foto"
  | "subjects";

/**********************
 * Helpers v4/v5
 **********************/

function getAttr<T = unknown>(row: Teacher, key: KnownKey): T | undefined {
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
    if ("url" in obj || (obj as { url?: string }).url !== undefined) return [obj as Media];
    const d = (obj as { data?: unknown }).data;
    if (Array.isArray(d)) return d as Media[];
    if (d && typeof d === "object") return [d as Media];
  }
  return [];
}

function getSubjectArray(val: unknown): (SubjectV5 | SubjectV4)[] {
  if (Array.isArray(val)) return val as (SubjectV5 | SubjectV4)[];
  if (val && typeof val === "object") {
    const d = (val as { data?: unknown }).data;
    if (Array.isArray(d)) return d as (SubjectV5 | SubjectV4)[];
    if (d && typeof d === "object") return [d as SubjectV5 | SubjectV4];
  }
  return [];
}

function subjectName(s: SubjectV5 | SubjectV4): string {
  const v5 = s as SubjectV5;
  if (v5 && v5.name !== undefined) return v5.name ?? "";
  const v4 = s as SubjectV4;
  return v4.attributes?.name ?? "";
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

function fullName(row: Teacher): string {
  const fn = (getAttr<string>(row, "firstName") ?? "").trim();
  const ln = (getAttr<string>(row, "lastName") ?? "").trim();
  const joined = `${fn} ${ln}`.trim();
  return joined || "Unnamed";
}

function normalizeStaff(raw?: string | null): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
}

/**********************
 * Simple UI atoms
 **********************/

function Badge({ children }: { children: React.ReactNode }) {
return (
<span
className="inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold uppercase tracking-wider"
style={{ borderColor: "#e6e6f0", color: "var(--hs-blue)" }}
>
{children}
</span>
);
}


function SubjectTag({ children }: { children: React.ReactNode }) {
return (
<span className="rounded-full border px-3 py-1 text-sm" style={{ borderColor: "#e6e6f0" }}>
{children}
</span>
);
}


function Card({ children }: { children: React.ReactNode }) {
return (
<div
className="h-full rounded-3xl border bg-white p-8 md:p-10 shadow-[0_20px_70px_-35px_rgba(17,6,49,0.35)]"
style={{ borderColor: "#ececf4" }}
>
{children}
</div>
);
}


function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section
      className="relative w-full py-10 md:py-14 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(70rem 40rem at 100% -10%, rgba(17,6,49,0.06), transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 🎓 Birrete (Hughes) — base azul y más cerca del título */}
        <div className="inline-flex items-center justify-center -mb-1 md:-mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 64 64"
            aria-hidden
          >
            {/* Ala del birrete */}
            <path d="M32 10 6 20l26 10 26-10-26-10z" fill="var(--hs-blue)" />
            <path
              d="M6 20l26 10 26-10"
              fill="none"
              stroke="rgba(10,35,66,0.25)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Base/cinta del birrete (ahora azul) */}
            <path d="M18 24h28v7c0 4.5-6.7 8-14 8s-14-3.5-14-8v-7z" fill="var(--hs-blue)" />
            {/* Sutil brillo en el borde de la base */}
            <path
              d="M18 26h28"
              stroke="rgba(255,255,255,.25)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Borla */}
            <path
              d="M50 22v11"
              fill="none"
              stroke="var(--hs-yellow)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="50" cy="35" r="3.5" fill="var(--hs-yellow)" />
          </svg>
        </div>

        <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight text-hughes-blue">
          {title}
        </h1>
        <p className="text-sm md:text-base mt-2 text-hughes-blue/80">{subtitle}</p>
      </div>
    </section>
  );
}



/**********************
 * Page
 **********************/

const PAGE_SIZE = 8; // bigger cards, fewer per page

export default function AcademicStaffPage() {
  const [rows, setRows] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [staffFilter, setStaffFilter] = useState<string>("All");
  const [q, setQ] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
        const qs = new URLSearchParams();
        qs.set("populate[foto]", "true");
        qs.set("populate[subjects]", "true");
        qs.set("pagination[pageSize]", "300");
        const res = await fetch(`${base}/api/teachers?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        const items: Teacher[] = Array.isArray(json)
          ? (json as Teacher[])
          : ((json as { data?: Teacher[] }).data ?? []);
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

  // Build dynamic staff list (exclude ART)
  const staffOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const s = normalizeStaff(getAttr<string>(r, "staff") ?? "");
      if (s && s.toLowerCase() !== "art") set.add(s);
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  // Derived filtering (exclude ART always)
  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        const sNorm = normalizeStaff(getAttr<string>(r, "staff") ?? "").toLowerCase();
        if (sNorm === "art") return false; // never show Art staff
        if (staffFilter !== "All") {
          const s = normalizeStaff(getAttr<string>(r, "staff") ?? "");
          if (s !== staffFilter) return false;
        }
        if (q.trim()) {
          const name = fullName(r).toLowerCase();
          const email = (getAttr<string>(r, "email") ?? "").toLowerCase();
          const hay = (name + " " + email).includes(q.trim().toLowerCase());
          if (!hay) return false;
        }
        return true;
      })
      .sort((a, b) => fullName(a).localeCompare(fullName(b)));
  }, [rows, staffFilter, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => setPage(1), [staffFilter, q]);
  useEffect(() => setPage((p) => Math.min(p, totalPages)), [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <main className="min-h-screen" style={{ background: "#f9f9fb" }}>
      <Header title="Academic Staff" subtitle="Meet our teachers and coordinators." />

      <section className="pb-16" style={{ background: "#f9f9fb" }}>
        <div className="mx-auto max-w-7xl px-4">
          {/* Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {staffOptions.map((s) => {
                const active = s === staffFilter;
                return (
                  <button
                    key={s}
                    onClick={() => setStaffFilter(s)}
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
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or email..."
                className="rounded-full border px-5 py-3 text-sm min-w-[260px]"
                style={{ borderColor: "#e6e6f0", color: "var(--hs-blue)", background: "#fff" }}
              />
            </div>
          </div>

          {/* Grid / Content (bigger cards, two columns) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-full rounded-3xl border bg-white p-8 animate-pulse"
                  style={{ borderColor: "#ececf4" }}
                >
                  <div className="h-20 w-20 bg-[#ececf4] rounded-full mb-4" />
                  <div className="h-6 w-52 bg-[#ececf4] rounded mb-2" />
                  <div className="h-5 w-28 bg-[#ececf4] rounded mb-4" />
                  <div className="h-28 w-full bg-[#f3f4f8] rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              className="rounded-xl border p-6 text-center text-hughes-blue"
              style={{ borderColor: "var(--hs-yellow)" }}
            >
              Error loading staff: {error}
            </div>
          ) : total === 0 ? (
            <p className="text-center text-hughes-blue">No staff found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr">
                {pageItems.map((r) => {
                  const name = fullName(r);
                  const staff = normalizeStaff(getAttr<string>(r, "staff") ?? "");
                  const email = getAttr<string>(r, "email") ?? "";

                  const fotoRaw = getAttr(r, "foto");
                  const fotoArr = getMediaArray(fotoRaw);
                  const foto = fotoArr[0] ?? null;
                  const avatarUrl = mediaUrl(foto);
                  const avatarAlt = mediaAlt(foto) ?? name;

                  const subjectsArr = getSubjectArray(getAttr(r, "subjects"));
                  const subjects = subjectsArr.map(subjectName).filter(Boolean);

                  return (
                    <Card key={String(r.id)}>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="h-24 w-24 md:h-28 md:w-28 rounded-full overflow-hidden border flex-shrink-0 bg-white"
                          style={{ borderColor: "#ececf4" }}
                        >
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={avatarAlt}
                              width={112}
                              height={112}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#f1f2f7]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-lg md:text-xl text-hughes-blue truncate">{name}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {staff && <Badge>{staff}</Badge>}
                            {email && (
                              <a
                                href={`mailto:${email}`}
                                className="text-sm underline text-hughes-blue/80 hover:text-hughes-blue"
                              >
                                {email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {subjects.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {subjects.map((s, i) => (
                            <SubjectTag key={`${r.id}-sub-${i}`}>{s}</SubjectTag>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
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
