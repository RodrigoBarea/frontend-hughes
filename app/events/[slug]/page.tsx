import Image from "next/image";
import { notFound } from "next/navigation";

/** ─────────── Config ─────────── */
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";

/** ─────────── Tipos genéricos v4/v5 ─────────── */
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

type BlogV5 = {
  id: number | string;
  title?: string;
  slug?: string;
  type?: string;
  content?: unknown; // string | Blocks
  featured_image?: Media | null;
  gallery?: Media[] | Media | null;
};

type BlogV4 = {
  id: number | string;
  attributes?: {
    title?: string;
    slug?: string;
    type?: string;
    content?: unknown; // string | Blocks
    featured_image?: { data?: Media | null } | Media | null;
    gallery?: { data?: Media[] | Media | null } | Media[] | Media | null;
  };
};

type Blog = BlogV4 | BlogV5;

type KnownFieldKey =
  | "title"
  | "slug"
  | "type"
  | "content"
  | "featured_image"
  | "gallery";

/** ─────────── Helpers v4/v5 ─────────── */
function getAttr<T = unknown>(row: Blog, key: KnownFieldKey): T | undefined {
  const root = row as Record<string, unknown>; // v5
  if (root[key] !== undefined) return root[key] as T;
  const attrs = (row as BlogV4).attributes as Record<string, unknown> | undefined; // v4
  if (attrs && attrs[key] !== undefined) return attrs[key] as T;
  return undefined;
}

function getMediaArray(val: unknown): Media[] {
  if (Array.isArray(val)) return val as Media[];
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if ("url" in obj || (obj as { url?: string }).url === undefined) {
      return [obj as Media];
    }
    const d = (obj as { data?: unknown }).data;
    if (Array.isArray(d)) return d as Media[];
    if (d && typeof d === "object") return [d as Media];
  }
  return [];
}

function abs(u?: string | null) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${API_URL}${u}`;
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

function pickCover(blog: Blog): { url: string; alt: string } | null {
  const title = (getAttr<string>(blog, "title") ?? "") as string;

  const fiRaw = getAttr(blog, "featured_image");
  const fiArr = getMediaArray(fiRaw);
  const fi = fiArr[0];
  const fiUrl = mediaUrl(fi);
  if (fiUrl) return { url: fiUrl, alt: mediaAlt(fi) ?? title };

  const galRaw = getAttr(blog, "gallery");
  const galArr = getMediaArray(galRaw);
  const first = galArr[0];
  const gUrl = mediaUrl(first);
  if (gUrl) return { url: gUrl, alt: mediaAlt(first) ?? title };

  return null;
}

/** ─────────── Type guards ─────────── */
function hasDataArray(x: unknown): x is { data: Blog[] } {
  return typeof x === "object" && x !== null && "data" in x && Array.isArray((x as { data: unknown }).data);
}
function hasDataOne(x: unknown): x is { data: Blog | null } {
  return typeof x === "object" && x !== null && "data" in x;
}

/** ─────────── Data fetch ─────────── */
async function fetchRecap(slugOrId: string): Promise<Blog | null> {
  const qs = new URLSearchParams();
  qs.set("populate[featured_image]", "true");
  qs.set("populate[gallery]", "true");

  // por slug
  const bySlug = await fetch(
    `${API_URL}/api/blogs?filters[slug][$eq]=${encodeURIComponent(slugOrId)}&${qs.toString()}`,
    { next: { revalidate: 60 } }
  );
  if (bySlug.ok) {
    const js: unknown = await bySlug.json();
    const arr: Blog[] = Array.isArray(js) ? (js as Blog[]) : hasDataArray(js) ? js.data : [];
    if (arr.length > 0) return arr[0];
  }

  // por id
  const idNum = Number(slugOrId);
  if (!Number.isNaN(idNum)) {
    const byId = await fetch(`${API_URL}/api/blogs/${idNum}?${qs.toString()}`, {
      next: { revalidate: 60 },
    });
    if (byId.ok) {
      const js: unknown = await byId.json();
      return hasDataOne(js) ? (js.data ?? null) : ((js as Blog) ?? null);
    }
  }
  return null;
}

/** ─────────── Tipos y renderer de Blocks ─────────── */
type BlockText = { text?: string };
type ListItem = { children?: BlockText[] };
type BlockNode = {
  type?: string;
  text?: string;
  children?: Array<BlockText | ListItem>;
};

function renderBlocks(content: unknown) {
  if (!content) return null;

  if (typeof content === "string") {
    return (
      <div
        className="prose prose-zinc max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  if (Array.isArray(content)) {
    const nodes = content as BlockNode[];
    return (
      <div className="prose prose-zinc max-w-none">
        {nodes.map((node, idx) => {
          const childTexts =
            node.children?.map((c) =>
              "text" in (c as BlockText) ? ((c as BlockText).text ?? "") : ""
            ) ?? [];
          const text = childTexts.join("") || node.text || "";

          switch (node.type) {
            case "heading":
            case "heading1":
            case "h1":
              return <h1 key={idx}>{text}</h1>;
            case "heading2":
            case "h2":
              return <h2 key={idx}>{text}</h2>;
            case "heading3":
            case "h3":
              return <h3 key={idx}>{text}</h3>;
            case "quote":
              return <blockquote key={idx}>{text}</blockquote>;
            case "ul":
            case "list": {
              const liChildren = (node.children as ListItem[] | undefined) ?? [];
              return (
                <ul key={idx}>
                  {liChildren.map((li, i) => {
                    const t =
                      li.children?.map((c) => c.text ?? "").join("") ?? "";
                    return <li key={i}>{t}</li>;
                  })}
                </ul>
              );
            }
            default:
              return <p key={idx}>{text}</p>;
          }
        })}
      </div>
    );
  }

  return null;
}

/** ─────────── SEO ─────────── */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await fetchRecap(params.slug);
  if (!data) return { title: "Event Recap" };
  const title = (getAttr<string>(data, "title") ?? "Event Recap") as string;
  const cover = pickCover(data);
  return {
    title: `${title} — Event Recap`,
    openGraph: cover ? { images: [{ url: cover.url }], title } : { title },
  };
}

/** ─────────── Página ─────────── */
export default async function RecapPage({ params }: { params: { slug: string } }) {
  const data = await fetchRecap(params.slug);
  if (!data) notFound();

  const title = (getAttr<string>(data, "title") ?? "Untitled") as string;
  const type = (getAttr<string>(data, "type") ?? "") as string;
  const content = getAttr<unknown>(data, "content");
  const galleryRaw = getAttr(data, "gallery");
  const gallery = getMediaArray(galleryRaw);
  const cover = pickCover(data);

  return (
    <main className="min-h-screen" style={{ background: "#f5f6fb" }}>
      {/* Hero solo imagen */}
      <section className="relative">
        {cover ? (
          <div className="relative w-full h-[42vh] md:h-[56vh] overflow-hidden">
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.25)_40%,transparent_60%)]" />
          </div>
        ) : (
          <div className="h-40 md:h-52 bg-[#ebeaf3]" />
        )}
      </section>

      {/* Contenido + título juntos y contenedor más ancho */}
      <section className="pt-10 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <article
            className="rounded-3xl border bg-white p-6 md:p-10 text-hughes-blue shadow-[0_16px_80px_-30px_rgba(17,6,49,0.25)]"
            style={{ borderColor: "#ececf4" }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold bg-white"
                style={{ borderColor: "#e6e6f0" }}
              >
                {type || "Event"}
              </div>
              <a
                href="/events"
                className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold"
                style={{ borderColor: "var(--hs-yellow)" }}
              >
                ← Back to all events
              </a>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              {title}
            </h1>

            {renderBlocks(content)}
          </article>

          {/* Galería */}
          {gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-3 text-hughes-blue">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {gallery.map((m, i) => {
                  const url = mediaUrl(m);
                  if (!url) return null;
                  const alt = mediaAlt(m) ?? title;
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block overflow-hidden rounded-2xl border"
                      style={{ borderColor: "#ececf4" }}
                    >
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={url}
                          alt={alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(min-width: 768px) 33vw, 50vw"
                        />
                      </div>
                      <span
                        className="pointer-events-none absolute inset-0 ring-0 ring-transparent group-hover:ring-4 rounded-2xl transition-all"
                        style={{ boxShadow: "0 8px 40px -18px rgba(17,6,49,0.35)" }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
