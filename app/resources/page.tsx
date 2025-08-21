"use client";

import * as React from "react";
import Link from "next/link";
import { FileDown, Download, Search, Filter } from "lucide-react";

/* ─────────── Brand ─────────── */
const BRAND = {
  blue: "var(--hs-blue)",
  yellow: "var(--hs-yellow)",
};

/* ─────────── Tipos & helpers Strapi v4/v5 ─────────── */
type MediaAttrs = { url?: string; name?: string; mime?: string };
type MediaEntry = { id?: number | string; attributes?: MediaAttrs } & MediaAttrs;
type RelationData<T> = { data?: T | T[] | null } | T | T[] | null;

type ResourceV4 = { id: number | string; attributes?: { name?: string; file?: RelationData<MediaEntry> } };
type ResourceV5 = { id: number | string; name?: string; file?: RelationData<MediaEntry> };
type ResourceRow = ResourceV4 | ResourceV5;

type MediaNormalized = { url: string; name: string; mime?: string };

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function hasData(x: unknown): x is { data?: unknown } {
  return isObject(x) && "data" in x;
}
function abs(u?: string | null): string {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
  return `${base}${u}`;
}
function toMedia(m: unknown): MediaNormalized {
  if (!isObject(m)) return { url: "", name: "" };
  const me = m as MediaEntry;
  return {
    url: me.url ?? me.attributes?.url ?? "",
    name: me.name ?? me.attributes?.name ?? "",
    mime: me.mime ?? me.attributes?.mime ?? undefined,
  };
}
function normalizeMedia(rel: RelationData<MediaEntry>): MediaNormalized[] {
  if (!rel) return [];
  if (Array.isArray(rel)) return rel.map(toMedia);
  if (hasData(rel)) {
    const d = (rel as { data?: unknown }).data;
    if (!d) return [];
    return Array.isArray(d) ? d.map(toMedia) : [toMedia(d)];
  }
  return [toMedia(rel)];
}
function isV4(r: ResourceRow): r is ResourceV4 {
  return (r as ResourceV4).attributes !== undefined;
}
function getName(r: ResourceRow): string {
  return isV4(r) ? r.attributes?.name ?? "" : (r as ResourceV5).name ?? "";
}
function getFiles(r: ResourceRow): MediaNormalized[] {
  const rel = isV4(r) ? r.attributes?.file : (r as ResourceV5).file;
  return normalizeMedia(rel ?? null);
}
function asResourceArray(input: unknown): ResourceRow[] {
  if (Array.isArray(input)) return input as ResourceRow[];
  if (isObject(input) && "data" in input) {
    const d = (input as { data?: unknown }).data;
    if (Array.isArray(d)) return d as ResourceRow[];
  }
  return [];
}
function fileBadgeName(mime?: string, url?: string) {
  const u = (url ?? "").toLowerCase();
  if (mime?.includes("pdf") || u.endsWith(".pdf")) return "PDF";
  if (mime?.includes("word") || u.endsWith(".docx") || u.endsWith(".doc")) return "DOCX";
  return "FILE";
}
type Kind = "ALL" | "PDF" | "DOCX" | "OTHER";
function kindOf(mime?: string, url?: string): Kind {
  const badge = fileBadgeName(mime, url);
  if (badge === "PDF") return "PDF";
  if (badge === "DOCX") return "DOCX";
  return "OTHER";
}

/* ─────────── Página Resources ─────────── */
export default function ResourcesPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<
    Array<{ id: string; title: string; url: string; mime?: string }>
  >([]);

  // filtros
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState<Kind>("ALL");

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
        const qs = new URLSearchParams();
        qs.set("populate[file]", "true");
        qs.set("pagination[pageSize]", "300");
        const res = await fetch(`${base}/api/resources?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        const rows = asResourceArray(json);

        const flat: Array<{ id: string; title: string; url: string; mime?: string }> = [];
        rows.forEach((r) => {
          const baseName = getName(r) || "Untitled";
          getFiles(r).forEach((m, i) => {
            const url = abs(m.url);
            if (!url) return;
            flat.push({ id: `${String(r.id)}-${i}`, title: m.name || baseName, url, mime: m.mime });
          });
        });

        if (!cancel) setFiles(flat);
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return files.filter((f) => {
      const okSearch = !term || f.title.toLowerCase().includes(term);
      const k = kindOf(f.mime, f.url);
      const okKind = kind === "ALL" || k === kind;
      return okSearch && okKind;
    });
  }, [files, q, kind]);

  return (
    <main className="min-h-screen bg-white">
      {/* HERO con icono lucide grande */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div
              className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white"
              style={{ boxShadow: "0 28px 60px -28px rgba(17,6,49,.40)" }}
              aria-hidden
            >
              <FileDown size={44} color={BRAND.blue} strokeWidth={2.5} />
            </div>
          </div>

          <h1
            className="text-3xl md:text-6xl font-extrabold tracking-tight"
            style={{ color: BRAND.blue }}
          >
            Resources
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl"
             style={{ color: "rgba(17,6,49,.8)" }}>
            Download school regulations and documents.
          </p>
        </div>
      </section>

      {/* CONTROLES (buscador + filtros) */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {/* buscador */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={18}
                color="rgba(17,6,49,.55)"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-full border bg-white pl-9 pr-3 py-2 text-sm outline-none"
                style={{ borderColor: "#ececf4", color: BRAND.blue }}
                aria-label="Search resources"
              />
            </div>

            {/* chips de filtro */}
            <div className="flex items-center gap-2">
              <div
                className="hidden md:inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-hughes-blue/60"
                aria-hidden
              >
                <Filter size={14} />
                Filter
              </div>

              {(["ALL", "PDF", "DOCX", "OTHER"] as Kind[]).map((k) => {
                const active = kind === k;
                return (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className="rounded-full border px-3 py-1 text-sm transition"
                    style={
                      active
                        ? {
                            background: BRAND.yellow,
                            borderColor: BRAND.yellow,
                            color: BRAND.blue,
                          }
                        : {
                            background: "#fff",
                            borderColor: "#e6e6f0",
                            color: BRAND.blue,
                          }
                    }
                    aria-pressed={active}
                  >
                    {k === "ALL" ? "All" : k}
                  </button>
                );
              })}
            </div>
          </div>

          {/* conteo */}
          <div className="mt-2 text-xs" style={{ color: "rgba(17,6,49,.6)" }}>
            Showing <strong>{filtered.length}</strong> of {files.length}
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 pb-20 md:pb-28">
          {loading && (
            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: "#ececf4" }}
            >
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-gray-100" />
                ))}
              </div>
            </div>
          )}

          {!loading && error && (
            <div
              className="rounded-2xl border bg-white p-6 text-red-600"
              style={{ borderColor: "#fae2e2" }}
            >
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <div
                  className="rounded-2xl border bg-white p-10 text-center"
                  style={{ borderColor: "#ececf4", color: BRAND.blue }}
                >
                  No results.
                </div>
              ) : (
                <ul className="space-y-4">
                  {filtered.map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.url}
                        download
                        target={f.url.startsWith("http") ? "_blank" : undefined}
                        rel="noopener"
                        className="group flex items-center justify-between gap-4 rounded-2xl border bg-white p-4 md:p-5 transition hover:-translate-y-[1px]"
                        style={{
                          borderColor: "#ececf4",
                          boxShadow: "0 20px 70px -35px rgba(17,6,49,.12)",
                        }}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className="mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                            style={{ borderColor: "#e6e6f0", color: BRAND.blue }}
                          >
                            {fileBadgeName(f.mime, f.url)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold" style={{ color: BRAND.blue }}>
                              {f.title}
                            </span>
                            <span className="block text-xs" style={{ color: "rgba(17,6,49,.6)" }}>
                              Click to download
                            </span>
                          </span>
                        </div>

                        <span
                          className="shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition"
                          style={{
                            background: BRAND.yellow,
                            color: BRAND.blue,
                            border: `1px solid ${BRAND.yellow}`,
                            boxShadow: "0 12px 26px -14px rgba(255,187,0,.9)",
                          }}
                        >
                          <Download size={16} />
                          Download
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition"
                  style={{
                    background: "#fff",
                    color: BRAND.blue,
                    border: `1px solid ${BRAND.yellow}`,
                    boxShadow: "0 10px 24px -16px rgba(17,6,49,.18)",
                  }}
                >
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
