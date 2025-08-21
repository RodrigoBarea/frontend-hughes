/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, ExternalLink, Search, Tag as TagIcon, BookOpen } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';

/* ───────── Helpers v4/v5 ───────── */
type URec = Record<string, unknown>;
type AnyObj = Record<string, any>;

function parseList<T = URec>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === 'object' && 'data' in json) {
    const data = (json as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}
function body<T = URec>(row: URec): T {
  const a = row as { attributes?: unknown };
  return (a?.attributes && typeof a.attributes === 'object'
    ? (a.attributes as T)
    : (row as T)) as T;
}
function relOne(rel: unknown): URec | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return (rel[0] as URec) ?? null;
  if (rel && typeof rel === 'object' && 'data' in rel) {
    const d = (rel as { data?: unknown }).data;
    if (Array.isArray(d)) return (d[0] as URec) ?? null;
    if (d && typeof d === 'object') return d as URec;
    return null;
  }
  return rel as URec;
}
function relMany(rel: unknown): URec[] {
  if (!rel) return [];
  if (Array.isArray(rel)) return rel as URec[];
  if (rel && typeof rel === 'object' && 'data' in rel) {
    const d = (rel as { data?: unknown }).data;
    if (Array.isArray(d)) return d as URec[];
  }
  return [];
}
function abs(u?: string | null) {
  if (!u) return null;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `${API}${u}`;
}
function mediaUrl(m?: URec | null): string | null {
  if (!m) return null;
  const b = body<any>(m);
  const fmts = b.formats;
  const best = fmts?.medium?.url || fmts?.small?.url || b.url || null;
  return abs(best);
}
function mediaAlt(m?: URec | null) {
  if (!m) return undefined;
  const b = body<any>(m);
  return b.alternativeText || b.name || undefined;
}
async function fetchJSON(url: string, token?: string) {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { cache: 'no-store', headers });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status} ${JSON.stringify(j)}`);
  }
  return res.json();
}

/* ───────── Página Library ───────── */
export default function LibraryPage() {
  // filtros
  const [q, setQ] = React.useState('');
  const [gradeId, setGradeId] = React.useState<string>('');
  const [subjectId, setSubjectId] = React.useState<string>('');
  // const [sectionId, setSectionId] = React.useState<string>(''); // si luego quieres filtrar por sección

  // datos
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<URec[]>([]);
  const [grades, setGrades] = React.useState<Array<{ id: string; name: string }>>([]);
  const [subjects, setSubjects] = React.useState<Array<{ id: string; name: string }>>([]);
  // const [sections, setSections] = React.useState<Array<{ id: string; name: string }>>([]);

  // paginación simple en cliente
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const p = new URLSearchParams();
        p.set('populate[file]', 'true');
        p.set('populate[grade]', 'true');
        p.set('populate[section]', 'true');
        p.set('populate[subject]', 'true');
        p.set('pagination[pageSize]', '200'); // trae lote amplio
        const url = `${API}/api/textbooks?${p.toString()}`;
        const json = await fetchJSON(url);
        const list = parseList(json);
        setItems(list);

        // construir catálogos desde los propios textbooks
        const gMap = new Map<string, string>();
        const sMap = new Map<string, string>();
        // const secMap = new Map<string, string>();

        for (const it of list) {
          const b = body<any>(it);

          const g = relOne(b.grade);
          if (g) gMap.set(String((g as any).id ?? (g as any).documentId), body<any>(g).name ?? '—');

          const s = relOne(b.subject);
          if (s) sMap.set(String((s as any).id ?? (s as any).documentId), body<any>(s).name ?? '—');

          // const sec = relOne(b.section);
          // if (sec) secMap.set(String((sec as any).id ?? (sec as any).documentId), body<any>(sec).name ?? '—');
        }
        setGrades(Array.from(gMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
        setSubjects(Array.from(sMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
        // setSections(Array.from(secMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e: unknown) {
        setError((e as Error)?.message || 'Error al cargar el catálogo.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filtrado
  const filtered = React.useMemo(() => {
    let out = items.slice();

    if (gradeId) {
      out = out.filter(it => {
        const b = body<any>(it);
        const g = relOne(b.grade);
        const id = g ? String((g as any).id ?? (g as any).documentId) : '';
        return id === gradeId;
      });
    }

    if (subjectId) {
      out = out.filter(it => {
        const b = body<any>(it);
        const s = relOne(b.subject);
        const id = s ? String((s as any).id ?? (s as any).documentId) : '';
        return id === subjectId;
      });
    }

    // if (sectionId) { ... }

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      out = out.filter(it => {
        const b = body<any>(it);
        const gradeName = relOne(b.grade) ? (body<any>(relOne(b.grade)!).name || '') : '';
        const subjectName = relOne(b.subject) ? (body<any>(relOne(b.subject)!).name || '') : '';
        const sectionName = relOne(b.section) ? (body<any>(relOne(b.section)!).name || '') : '';
        return (
          (b.title || '').toLowerCase().includes(qq) ||
          (b.author || '').toLowerCase().includes(qq) ||
          gradeName.toLowerCase().includes(qq) ||
          subjectName.toLowerCase().includes(qq) ||
          sectionName.toLowerCase().includes(qq)
        );
      });
    }
    return out;
  }, [items, gradeId, subjectId, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => { setPage(1); }, [q, gradeId, subjectId]);

  const onExport = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    window.print();
  }, []);

  // helpers de portada/descarga a partir de "file" (Multiple Media)
  function pickCoverAndDownload(filesRel: unknown) {
    const files = relMany(filesRel);
    let cover: URec | null = null;
    let download: URec | null = null;

    for (const f of files) {
      const b = body<any>(f);
      const mime = String(b.mime || '');
      if (!cover && mime.startsWith('image/')) cover = f;
      if (!download && !mime.startsWith('image/')) download = f;
    }
    // si no hay imagen, intenta usar el primero como “portada”
    if (!cover && files[0]) cover = files[0];
    return { cover, download };
  }

  return (
    <div className="min-h-screen print:bg-white" style={{ background: '#f9f9fb' }}>
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          .print-hide { display: none !important; }
          html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <section className="w-full py-10">
        <div className="mx-auto max-w-7xl px-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 print-hide">
            <div className="flex items-center gap-2">
              <BookOpen className="text-hughes-blue" size={20} />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-hughes-blue">Library</h1>
            </div>
            <div className="flex items-center gap-2">

              <Link
                href="/student/help-center"
                className="inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold bg-white hover:bg-slate-50"
                style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)' }}
              >
                Volver al portal
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3 print-hide">
            <div className="sm:col-span-1">
              <label className="block text-sm font-semibold text-hughes-blue">Buscar</label>
              <div className="mt-2 flex items-center rounded-xl border bg-white px-3 ring-1 ring-slate-200">
                <Search size={16} className="text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Título, autor, materia…"
                  className="ml-2 w-full py-2 outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-semibold text-hughes-blue">Grado</label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <option value="">Todos</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-semibold text-hughes-blue">Asignatura</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <option value="">Todas</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Si luego quieres por sección:
            <div className="sm:col-span-1">
              <label className="block text-sm font-semibold text-hughes-blue">Sección</label>
              <select value={sectionId} onChange={(e)=>setSectionId(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-3 py-2 ring-1 ring-slate-200">
                <option value="">Todas</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div> */}
          </div>

          {/* Estados */}
          {loading && (
            <div className="mt-6 rounded-2xl border bg-white p-6 text-center text-hughes-blue shadow-sm" style={{ borderColor: '#ececf4' }}>
              Cargando catálogo…
            </div>
          )}
          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          )}

          {/* Resultados */}
          {!loading && !error && (
            <>
              <div className="mt-4 text-sm text-hughes-blue/70">
                {filtered.length} libro{filtered.length === 1 ? '' : 's'} encontrado{filtered.length === 1 ? '' : 's'}
                {gradeId && <> • Grado: <span className="font-semibold">{grades.find(g => g.id === gradeId)?.name}</span></>}
                {subjectId && <> • Asignatura: <span className="font-semibold">{subjects.find(s => s.id === subjectId)?.name}</span></>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((it) => {
                  const b = body<any>(it);

                  const gradeRel = relOne(b.grade);
                  const gradeName = gradeRel ? (body<any>(gradeRel).name || '') : '';

                  const subjectRel = relOne(b.subject);
                  const subjectName = subjectRel ? (body<any>(subjectRel).name || '') : '';

                  const sectionRel = relOne(b.section);
                  const sectionName = sectionRel ? (body<any>(sectionRel).name || '') : '';

                  const { cover, download } = pickCoverAndDownload(b.file);
                  const coverUrl = mediaUrl(cover);
                  const fileUrl = download ? mediaUrl(download) : null;

                  const link = b.link ? String(b.link) : '';

                  return (
                    <article key={String((it as any).id ?? (it as any).documentId)} className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: '#ececf4' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverUrl || '/placeholder-cover.png'}
                        alt={mediaAlt(cover) || b.title}
                        className="h-48 w-full object-cover"
                      />
                      <div className="p-4">
                        <h3 className="line-clamp-2 font-semibold text-hughes-blue">{b.title}</h3>
                        {b.author && <p className="mt-0.5 text-sm text-hughes-blue/70">{b.author}</p>}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {gradeName && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-hughes-blue">
                              {gradeName}
                            </span>
                          )}
                          {subjectName && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                              style={{ background: 'rgba(255,187,0,0.22)', color: 'var(--hs-blue)' }}
                            >
                              <TagIcon size={12} /> {subjectName}
                            </span>
                          )}
                          {sectionName && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-hughes-blue">
                              {sectionName}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {link && (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                              style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)' }}
                            >
                              <ExternalLink size={14} /> Ver recurso
                            </a>
                          )}
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                              style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)' }}
                              download
                            >
                              <Download size={14} /> Descargar
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2 print-hide">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                    style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)', background: 'white' }}
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-hughes-blue/80">Página {page} de {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                    style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)', background: 'white' }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
