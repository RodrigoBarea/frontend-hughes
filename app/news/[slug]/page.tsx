import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsGallery from "@/components/NewsGallerySection";

/* Opcional: ISR (revalidate cada 1 min) */
export const revalidate = 60;

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
type KnownKey =
  | "title"
  | "slug"
  | "content"
  | "date"
  | "featured_image"
  | "gallery";

/** Respuesta típica de Strapi (lista) */
type StrapiList<T> = { data?: T[] };

/* ───────────── Helpers v4/v5 ───────────── */
function getAttr<T = unknown>(row: Article | null, key: KnownKey): T | undefined {
  if (!row) return undefined;
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
    if ("url" in obj) return [obj as Media];
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

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ───────────── Util para parsear respuesta sin any ───────────── */
function parseStrapiList<T>(json: unknown): T[] {
  if (Array.isArray(json)) {
    return json as T[];
  }
  if (json && typeof json === "object" && "data" in json) {
    const data = (json as StrapiList<T>).data;
    return Array.isArray(data) ? data : [];
    }
  return [];
}

/* ───────────── Data fetching ───────────── */
async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
  const qs = new URLSearchParams();
  qs.set("populate[featured_image]", "true");
  qs.set("populate[gallery]", "true");
  qs.set("pagination[pageSize]", "1");
  qs.set("filters[slug][$eq]", slug);

  const url = `${base}/api/newspapers?${qs.toString()}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;

  const json = (await res.json()) as unknown;
  const items = parseStrapiList<Article>(json);
  if (items.length > 0) return items[0];

  // Fallback: si pasaron un id en lugar de slug
  const asId = Number.isNaN(Number(slug)) ? null : Number(slug);
  if (asId !== null) {
    const qs2 = new URLSearchParams();
    qs2.set("populate[featured_image]", "true");
    qs2.set("populate[gallery]", "true");
    qs2.set("filters[id][$eq]", String(asId));
    const res2 = await fetch(`${base}/api/newspapers?${qs2.toString()}`, {
      next: { revalidate },
    });
    if (!res2.ok) return null;
    const json2 = (await res2.json()) as unknown;
    const items2 = parseStrapiList<Article>(json2);
    return items2[0] ?? null;
  }

  return null;
}

/* ───────────── SEO dinámico ───────────── */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await fetchArticleBySlug(params.slug);
  const title = (getAttr<string>(article ?? ({} as Article), "title") ?? "News") as string;
  const content = (getAttr<string>(article ?? ({} as Article), "content") ?? "") as string;
  const desc = content.replace(/<[^>]+>/g, "").slice(0, 160);
  const cover = article ? pickCover(article) : null;

  return {
    title: `${title} — Hughes Newspaper`,
    description: desc || "News article",
    openGraph: {
      title,
      description: desc,
      images: cover?.url ? [{ url: cover.url }] : [],
    },
  };
}

/* ───────────── Página ───────────── */
export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await fetchArticleBySlug(params.slug);
  if (!article) return notFound();

  const title = (getAttr<string>(article, "title") ?? "Untitled") as string;
  const date = (getAttr<string>(article, "date") ?? "") as string;
  const content = (getAttr<string>(article, "content") ?? "") as string;

  const cover = pickCover(article);

  const galRaw = getAttr(article, "gallery");
  const gallery = getMediaArray(galRaw)
    .map((m) => ({ url: mediaUrl(m), alt: mediaAlt(m) ?? title }))
    .filter((g) => !!g.url) as { url: string; alt: string }[];

  return (
    <section className="w-full py-12 md:py-16" style={{ background: "#f5f6fb" }}>
      <div className="mx-auto max-w-5xl px-4">
        {/* Título */}
        <h1 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-hughes-blue">
          {title}
        </h1>

        {/* Fecha */}
        {date && (
          <div className="mt-2 text-center text-sm text-hughes-blue/70">
            {formatDate(date)}
          </div>
        )}

        {/* Portada más pequeña y centrada */}
        {cover?.url && (
          <div className="mt-6 flex justify-center">
            <Image
              src={cover.url}
              alt={cover.alt}
              width={700}
              height={400}
              className="rounded-2xl object-cover"
              priority
            />
          </div>
        )}

        {/* Contenido más grande y centrado */}
        <article className="prose prose-xl mt-8 mx-auto text-center max-w-3xl prose-h2:text-hughes-blue prose-a:text-[var(--hs-blue)]">
          {typeof content === "string" && /<\/?[a-z][\s\S]*>/i.test(content) ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p>{content}</p>
          )}
        </article>

        {/* Galería (usa componente sin título) */}
        {gallery.length > 0 && (
          <div className="mt-16">
            <NewsGallery images={gallery} />
          </div>
        )}

        {/* Botón Back to News al final (único) */}
        <div className="mt-12 text-left">
          <Link
            href="/news"
            className="inline-flex items-center text-sm font-semibold"
            style={{ color: "var(--hs-blue)" }}
          >
            ← Back to News
          </Link>
        </div>
      </div>
    </section>
  );
}
