"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

/** ───────────── Tipos ───────────── */

type Media = {
  id?: number | string;
  url?: string;                    // v5
  alternativeText?: string | null; // v5
  attributes?: {                   // v4
    url?: string;
    alternativeText?: string | null;
  };
};

type KnownFieldKey = "title" | "type" | "gallery" | "featured_image";

type BlogV5 = {
  id: number | string;
  title?: string;
  type?: string;
  gallery?: Media[] | Media | null;
  featured_image?: Media | null;
};

type BlogV4 = {
  id: number | string;
  attributes?: {
    title?: string;
    type?: string;
    gallery?: { data?: Media[] | Media | null } | Media[] | Media | null;
    featured_image?: { data?: Media | null } | Media | null;
  };
};

type Blog = BlogV4 | BlogV5;

/** ───────────── Helpers v4/v5 ───────────── */

function getAttr<T = unknown>(row: Blog, key: KnownFieldKey): T | undefined {
  if ((row as Record<string, unknown>)[key] !== undefined) {
    return (row as Record<string, unknown>)[key] as T; // v5
  }
  const attrs = (row as BlogV4).attributes as Record<string, unknown> | undefined; // v4
  if (attrs && attrs[key] !== undefined) {
    return attrs[key] as T;
  }
  return undefined;
}

function getMediaArray(val: unknown): Media[] {
  if (Array.isArray(val)) return val as Media[];
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.url === "string" || obj.url === undefined) return [obj as Media];
    const d = obj.data as unknown;
    if (Array.isArray(d)) return d as Media[];
    if (d && typeof d === "object") return [d as Media];
  }
  return [];
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

function abs(u?: string | null) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
  return `${base}${u}`;
}

function normalizeGallery(blog: Blog): { url: string; alt: string }[] {
  const title = (getAttr<string>(blog, "title") ?? "") as string;
  const galleryRaw = getAttr(blog, "gallery");
  const galleryArr = getMediaArray(galleryRaw);

  const items: { url: string; alt: string }[] = [];
  for (const m of galleryArr) {
    const url = mediaUrl(m);
    if (url) items.push({ url, alt: mediaAlt(m) ?? title });
  }

  if (items.length === 0) {
    const fiRaw = getAttr(blog, "featured_image");
    const fiArr = getMediaArray(fiRaw);
    const fi = fiArr[0] ?? null;
    const url = mediaUrl(fi);
    if (url) items.push({ url, alt: mediaAlt(fi) ?? title });
  }
  return items;
}

/** ───────────── Copys UI ───────────── */

const TYPE_COPY: Record<string, { title: string; blurb: string }> = {
  Academic: {
    title: "Academic",
    blurb:
      "Moments that celebrate learning: science fairs, competitions, and student achievements reflecting our community's academic effort.",
  },
  Artistic: {
    title: "Artistic",
    blurb:
      "Expressions of art and culture: performances, music, dance, and everything that showcases the creative talent of our students.",
  },
  Extracurricular: {
    title: "Extracurricular",
    blurb:
      "Experiences beyond the classroom: trips, sports activities, and special visits that strengthen the Hughes spirit.",
  },
};

/** ───────────── UI ───────────── */

function CTAButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full border-2 px-6 text-[15px] font-semibold shadow-xl transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 text-hughes-blue"
      style={{ borderColor: "var(--hs-yellow)" }}
    >
      <span className="absolute inset-0 rounded-full bg-white transition-opacity duration-200 group-hover:opacity-0" />
      <span className="relative z-10"> {children} </span>
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: "var(--hs-yellow)", mixBlendMode: "multiply" }}
      />
    </a>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium bg-white text-hughes-blue"
          style={{ borderColor: "#e6e6f0" }}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-[0_6px_40px_-20px_rgba(17,6,49,0.35)] text-hughes-blue ${className}`}
      style={{ borderColor: "#ececf4" }}
    >
      {children}
    </div>
  );
}

function Carousel({ images }: { images: { url: string; alt?: string }[] }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) {
    return (
      <div
        className="w-full aspect-[16/9] grid place-content-center rounded-2xl bg-neutral-50 border text-hughes-blue"
        style={{ borderColor: "#ececf4" }}
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          <span>No images available.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#ececf4" }}>
        <div className="relative w-full aspect-[16/9]">
          <AnimatePresence initial={false}>
            <motion.img
              key={index}
              src={images[index].url}
              alt={images[index].alt ?? ""}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              loading="lazy"
            />
          </AnimatePresence>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur px-2 py-2 rounded-xl shadow hover:bg-white text-hughes-blue"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            style={{ boxShadow: "0 6px 25px -10px rgba(17,6,49,0.35)" }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur px-2 py-2 rounded-xl shadow hover:bg-white text-hughes-blue"
            onClick={() => setIndex((i) => (i + 1) % count)}
            style={{ boxShadow: "0 6px 25px -10px rgba(17,6,49,0.35)" }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-6 rounded-full transition-all"
                style={{ backgroundColor: i === index ? "var(--hs-yellow)" : "var(--hs-blue)" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** ───────────── Página ───────────── */

export default function EventsRecapsTabs({ viewAllHref = "/events" }: { viewAllHref?: string }) {
  const [data, setData] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";

        const params = new URLSearchParams();
        params.set("populate[gallery]", "true");
        params.set("populate[featured_image]", "true");
        params.set("pagination[pageSize]", "100");

        const res = await fetch(`${base}/api/blogs?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as { data?: Blog[] } | Blog[];
        const items: Blog[] = Array.isArray(json) ? json : json?.data ?? [];
        if (!cancelled) setData(items);
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

  const grouped = useMemo(() => {
    const groups: Record<string, { images: { url: string; alt: string }[]; count: number }> = {
      Academic: { images: [], count: 0 },
      Artistic: { images: [], count: 0 },
      Extracurricular: { images: [], count: 0 },
    };

    for (const b of data) {
      const t = (getAttr<string>(b, "type") ?? "").toString();
      if (!groups[t]) continue;
      const imgs = normalizeGallery(b);
      groups[t].images.push(...imgs);
      groups[t].count += 1;
    }

    function shuffle<T>(arr: T[]): T[] {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    (["Academic", "Artistic", "Extracurricular"] as const).forEach((k) => {
      groups[k].images = shuffle(groups[k].images).slice(0, 5);
    });

    return groups;
  }, [data]);

  return (
    <section className="w-full py-16" style={{ background: "#f5f6fb" }}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Encabezado */}
        <div className="mb-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 tag-hs">
            Event Recaps
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-hughes-blue">
            Hughes Schools by the Moments
          </h2>
          <p className="text-sm md:text-base mt-2 text-hughes-blue">
            Relive the best snapshots of our community.
          </p>
        </div>

        {/* Tabs estilo HS */}
        <Tabs defaultValue="Academic" className="w-full">
          <TabsList className="mx-auto grid w-full max-w-xl grid-cols-3 rounded-full p-1 bg-[#ebeaf3]">
            {(["Academic", "Artistic", "Extracurricular"] as const).map((val) => (
              <TabsTrigger
                key={val}
                value={val}
                className="tab-pill rounded-full px-5 py-2 border border-transparent transition-colors data-[state=active]:bg-white"
              >
                {val}
              </TabsTrigger>
            ))}
          </TabsList>

          {(["Academic", "Artistic", "Extracurricular"] as const).map((key) => (
            <TabsContent key={key} value={key} className="mt-8">
              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Columna de texto */}
                <Card className="p-7 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-hughes-blue">
                      {TYPE_COPY[key].title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-hughes-blue">
                      {TYPE_COPY[key].blurb}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <CTAButton href={viewAllHref}>View all events</CTAButton>
                    <Chip>
                      {grouped[key].count > 0
                        ? `${grouped[key].count} recap${grouped[key].count === 1 ? "" : "s"}`
                        : "No recaps yet"}
                    </Chip>
                  </div>
                </Card>

                {/* Columna de carrusel */}
                <Card className="p-2">
                  {loading ? (
                    <div className="w-full aspect-[16/9] animate-pulse rounded-xl" style={{ background: "#ececf4" }} />
                  ) : error ? (
                    <div
                      className="w-full aspect-[16/9] grid place-content-center rounded-xl border text-center text-hughes-blue"
                      style={{ borderColor: "var(--hs-yellow)" }}
                    >
                      Error loading images: {error}
                    </div>
                  ) : (
                    <Carousel images={grouped[key].images} />
                  )}
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
