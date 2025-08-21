"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/* ───────────── Tipos Strapi v4/v5 ───────────── */

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
  title?: string;
  slug?: string;
  content?: string;
  date?: string;
  featured_image?: Media | null;
  gallery?: Media[] | Media | null;
};

type RowV4 = {
  id: number | string;
  attributes?: {
    title?: string;
    slug?: string;
    content?: string;
    date?: string;
    featured_image?: { data?: Media | null } | Media | null;
    gallery?: { data?: Media[] | Media | null } | Media[] | Media | null;
  };
};

type Article = RowV4 | RowV5;
type KnownKey = "title" | "slug" | "content" | "date" | "featured_image" | "gallery";

/* ───────────── Helpers v4/v5 ───────────── */

function getAttr<T = unknown>(row: Article, key: KnownKey): T | undefined {
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
  const best =
    fmts?.large?.url ??
    fmts?.medium?.url ??
    fmts?.small?.url ??
    m.url ??
    m.attributes?.url ??
    null;
  return abs(best);
}

function mediaAlt(m?: Media | null): string | undefined {
  return m?.alternativeText ?? m?.attributes?.alternativeText ?? undefined;
}

function pickCover(article: Article): { url: string; alt: string } | null {
  const title = (getAttr<string>(article, "title") ?? "") as string;

  const fiRaw = getAttr(article, "featured_image");
  const fiArr = getMediaArray(fiRaw);
  const fi = fiArr[0];
  const fiUrl = mediaUrl(fi);
  if (fiUrl) return { url: fiUrl, alt: mediaAlt(fi) ?? title };

  const galRaw = getAttr(article, "gallery");
  const galArr = getMediaArray(galRaw);
  const first = galArr[0];
  const gUrl = mediaUrl(first);
  if (gUrl) return { url: gUrl, alt: mediaAlt(first) ?? title };

  return null;
}

/* ───────────── UI ───────────── */

function SectionHeading() {
  return (
    <div className="mb-10 text-center">
      {/* Título estilizado: “Hughes Newspaper” */}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-hughes-blue inline-flex items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-6 w-6 rounded-full"
          style={{ background: "var(--hs-yellow)" }}
        />
        Hughes Schools Newspaper
      </h2>
      <p className="text-sm md:text-base mt-2 text-hughes-blue/80">
        Updates and highlights from our community.
      </p>
    </div>
  );
}

function Card({
  article,
  delay = 0,
}: {
  article: Article;
  delay?: number;
}) {
  const title = (getAttr<string>(article, "title") ?? "Untitled") as string;
  const slug = (getAttr<string>(article, "slug") ?? String(article.id)) as string;
  const cover = pickCover(article);

  const href = `/news/${encodeURIComponent(slug)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      {/* Imagen */}
      <a href={href} className="block overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              className="object-cover transition-transform duration-500"
              sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
            />
          ) : (
            <div className="h-full w-full bg-[#f1f2f7]" />
          )}
        </div>
      </a>

      {/* Texto */}
      <div className="mt-4">
        <div className="text-[12px] font-semibold tracking-widest uppercase text-hughes-blue">
          Hugues News
        </div>

        <a href={href}>
          <h3 className="mt-2 text-2xl font-semibold leading-snug text-hughes-blue">
            {title}
          </h3>
        </a>

        {/* Read More en amarillo */}
<a
  href={href}
  className="mt-3 inline-flex items-center text-[17px] font-semibold group"
  style={{ color: "var(--hs-yellow)" }}
>
  <span className="relative">
    Read More
    <span
      className="absolute left-0 -bottom-0.5 h-[2px] w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
      style={{ background: "var(--hs-yellow)" }}
    />
  </span>
</a>

      </div>
    </motion.article>
  );
}



/* ───────────── Botón See all (estilo referencia) ───────────── */
function SeeAllButton({ href }: { href: string }) {
  // Variante ligera con la MISMA mecánica de animación (overlay absoluto)
  // Base: borde + texto azules (ghost button)
  // Hover: se “llena” de azul y el texto pasa a blanco
  return (
    <a
      href={href}
      className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full border-2 px-8 text-[16px] font-semibold shadow-md transition-transform"
      style={{ borderColor: "var(--hs-blue)", color: "var(--hs-blue)" }}
    >
      {/* overlay animado como en tu patrón global */}
      <span className="absolute inset-0 rounded-full bg-[var(--hs-blue)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
        See all
      </span>
    </a>
  );
}



/* ───────────── Componente principal ───────────── */

export default function NewspaperStrip() {
  const [rows, setRows] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const base =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
        const qs = new URLSearchParams();
        qs.set("populate[featured_image]", "true");
        qs.set("populate[gallery]", "true");
        qs.set("pagination[pageSize]", "100");
        // Si usas v4/v5, esta ruta /api/newspapers es la que mostraste
        const res = await fetch(`${base}/api/newspapers?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        const items: Article[] = Array.isArray(json)
          ? (json as Article[])
          : (json as { data?: Article[] }).data ?? [];
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

  // Tomar los 3 más recientes si hay fecha; si no, primeros 3
  const top3 = useMemo(() => {
    const a = [...rows];
    a.sort((x, y) => {
      const dx = new Date((getAttr<string>(x, "date") ?? "") as string).getTime();
      const dy = new Date((getAttr<string>(y, "date") ?? "") as string).getTime();
      return isNaN(dy - dx) ? 0 : dy - dx;
    });
    return a.slice(0, 3);
  }, [rows]);

  return (
    <section className="w-full py-16" style={{ background: "#f5f6fb" }}>
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading />

        {/* Grid de 3 columnas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[320px] w-full rounded-3xl bg-white border animate-pulse"
                style={{ borderColor: "#ececf4" }}
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-xl border p-6 text-center text-hughes-blue"
            style={{ borderColor: "var(--hs-yellow)" }}
          >
            Error loading news: {error}
          </div>
        ) : top3.length === 0 ? (
          <p className="text-center text-hughes-blue">No news yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {top3.map((article, idx) => (
                <Card key={String(article.id)} article={article} delay={idx * 0.05} />
              ))}
            </div>

            {/* Botón See all debajo de las noticias */}
            <div className="mt-10 text-center">
              <SeeAllButton href="/news" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
