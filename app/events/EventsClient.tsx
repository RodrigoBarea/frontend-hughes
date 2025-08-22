// app/events/EventsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ───────── Tipos ───────── */
export const TYPES = ["All", "Academic", "Artistic", "Extracurricular"] as const;
export type EventType = (typeof TYPES)[number];

type Media = {
  id?: number | string;
  url?: string;
  alternativeText?: string | null;
  attributes?: {
    url?: string;
    alternativeText?: string | null;
  };
};

type KnownFieldKey = "title" | "type" | "gallery" | "featured_image" | "slug";

type BlogV5 = {
  id: number | string;
  title?: string;
  type?: string;
  slug?: string;
  gallery?: Media[] | Media | null;
  featured_image?: Media | null;
};

type BlogV4 = {
  id: number | string;
  attributes?: {
    title?: string;
    type?: string;
    slug?: string;
    gallery?:
      | { data?: Media[] | Media | null }
      | Media[]
      | Media
      | null;
    featured_image?:
      | { data?: Media | null }
      | Media
      | null;
  };
};

type Blog = BlogV4 | BlogV5;

/* ───────── Helpers de tipo ───────── */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getAttr<T = unknown>(row: Blog, key: KnownFieldKey): T | undefined {
  if (isRecord(row) && key in row) {
    return (row as Record<KnownFieldKey, unknown>)[key] as T; // v5
  }
  const attrs = (row as { attributes?: unknown }).attributes;
  if (isRecord(attrs) && key in attrs) {
    return (attrs as Record<KnownFieldKey, unknown>)[key] as T; // v4
  }
  return undefined;
}

function getMediaArray(val: unknown): Media[] {
  if (Array.isArray(val)) return val as Media[];
  if (isRecord(val)) {
    if ("url" in val) return [val as Media]; // v5: media directo
    const d = (val as { data?: unknown }).data;
    if (Array.isArray(d)) return d as Media[];
    if (isRecord(d)) return [d as Media];
  }
  return [];
}

function abs(u?: string | null): string | null {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
  return `${base}${u}`;
}

function mediaUrl(m?: Media | null): string | null {
  if (!m) return null;
  if (typeof m.url === "string") return abs(m.url);
  if (m.attributes?.url) return abs(m.attributes.url);
  return null;
}

function mediaAlt(m?: Media | null): string | undefined {
  return m?.alternativeText ?? m?.attributes?.alternativeText ?? undefined;
}

function normalizeCover(blog: Blog): { url: string; alt: string } | null {
  const title = (getAttr<string>(blog, "title") ?? "") as string;

  const gRaw = getAttr(blog, "gallery");
  const gArr = getMediaArray(gRaw);
  const first = gArr[0];
  const u1 = mediaUrl(first);
  if (u1) return { url: u1, alt: mediaAlt(first) ?? title };

  const fRaw = getAttr(blog, "featured_image");
  const fArr = getMediaArray(fRaw);
  const f = fArr[0] ?? null;
  const u2 = mediaUrl(f);
  if (u2) return { url: u2, alt: mediaAlt(f) ?? title };

  return null;
}

function recapHref(item: Blog): string {
  const slug = (getAttr<string>(item, "slug") ?? "").trim();
  return slug ? `/events/${encodeURIComponent(slug)}` : `/events/${encodeURIComponent(String(item.id))}`;
}

/* ───────── Constantes ───────── */
const PAGE_SIZE = 6;

/* ───────── Props ───────── */
type Props = {
  initialType: EventType;
  initialPage: number;
};

/* ───────── Component ───────── */
export default function EventsClient({ initialType, initialPage }: Props) {
  const router = useRouter();

  const [typeParam, setTypeParam] = useState<EventType>(initialType);
  const [pageParam, setPageParam] = useState<number>(initialPage);

  const [data, setData] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
        const qs = new URLSearchParams();
        qs.set("populate[gallery]", "true");
        qs.set("populate[featured_image]", "true");
        qs.set("pagination[pageSize]", "100");

        const res = await fetch(`${base}/api/blogs?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: unknown = await res.json();
        const items: Blog[] = Array.isArray(json)
          ? (json as Blog[])
          : (isRecord(json) && Array.isArray(json.data) ? (json.data as Blog[]) : []);

        if (!cancelled) setData(items);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (typeParam === "All") return data;
    return data.filter((b) => (getAttr<string>(b, "type") || "") === typeParam);
  }, [data, typeParam]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  function pushQuery(next: { page?: number; type?: EventType }) {
    const nextType = next.type ?? typeParam;
    const nextPage = next.page ?? (next.type ? 1 : pageParam);

    const qs = new URLSearchParams();
    if (nextType !== "All") qs.set("type", nextType);
    if (nextPage > 1) qs.set("page", String(nextPage));

    setTypeParam(nextType);
    setPageParam(nextPage);
    router.push(qs.toString() ? `/events?${qs.toString()}` : "/events", { scroll: true });
  }

  return (
    <section className="w-full py-16" style={{ background: "#f5f6fb" }}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex items-center gap-2 tag-hs">Event Recaps</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-hughes-blue">All Events</h1>
          <p className="text-sm md:text-base mt-2 text-hughes-blue">
            Browse our academic, artistic, and extracurricular moments.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {TYPES.map((t) => {
            const active = t === typeParam;
            return (
              <button
                key={t}
                className="tab-pill rounded-full px-4 py-2 border transition-colors"
                onClick={() => pushQuery({ type: t })}
                style={
                  active
                    ? { background: "var(--hs-yellow)", borderColor: "var(--hs-yellow)" }
                    : { background: "#ffffff", borderColor: "transparent" }
                }
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="h-[320px] bg-white rounded-2xl border animate-pulse" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border p-6 text-center text-hughes-blue"
              style={{ borderColor: "var(--hs-yellow)" }}
            >
              Error loading events: {error}
            </motion.div>
          ) : total === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-hughes-blue"
            >
              No events published yet.
            </motion.p>
          ) : (
            <motion.div
              key={`${typeParam}-${page}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {pageItems.map((item) => {
                const title = (getAttr<string>(item, "title") ?? "Untitled") as string;
                const type = (getAttr<string>(item, "type") ?? "") as string;
                const cover = normalizeCover(item);
                const href = recapHref(item);

                return (
                  <article key={String(item.id)}>
                    <Link href={href} className="block relative overflow-hidden rounded-3xl">
                      <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden">
                        {cover ? (
                          <Image
                            src={cover.url}
                            alt={cover.alt}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-neutral-100" />
                        )}
                      </div>
                    </Link>
                    <div className="mt-4">
                      <div className="text-[12px] font-semibold tracking-widest uppercase text-hughes-blue">{type || ""}</div>
                      <h3 className="mt-2 text-2xl font-semibold leading-snug text-hughes-blue">{title}</h3>
                      <Link href={href} className="group inline-flex items-center mt-3">
                        <span className="relative text-base font-semibold text-hughes-blue">
                          Read more
                          <span
                            className="absolute left-0 -bottom-0.5 h-[2px] w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                            style={{ background: "var(--hs-yellow)" }}
                          />
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              className="rounded-full border px-3 py-2 text-hughes-blue disabled:opacity-40"
              onClick={() => pushQuery({ page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              style={{ background: "var(--hs-yellow)", borderColor: "var(--hs-yellow)" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <button
                  key={p}
                  onClick={() => pushQuery({ page: p })}
                  className="rounded-full px-4 py-2 text-sm tab-pill border"
                  style={
                    active
                      ? { background: "var(--hs-yellow)", borderColor: "var(--hs-yellow)" }
                      : { background: "#ffffff", borderColor: "transparent" }
                  }
                >
                  {p}
                </button>
              );
            })}

            <button
              className="rounded-full border px-3 py-2 text-hughes-blue disabled:opacity-40"
              onClick={() => pushQuery({ page: Math.min(totalPages, page + 1) })}
              disabled={page >= totalPages}
              style={{ background: "var(--hs-yellow)", borderColor: "var(--hs-yellow)" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
