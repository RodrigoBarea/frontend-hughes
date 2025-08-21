/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Tag, Download } from 'lucide-react';

/* =========================
   Config & Helpers
   ========================= */
const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';

type UnknownRecord = Record<string, unknown>;
type AnyObj = Record<string, any>;

/* List response v4/v5 */
function parseList<T = UnknownRecord>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === 'object' && 'data' in json) {
    const data = (json as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

/* attributes (v4) vs plano (v5) */
function body<T = UnknownRecord>(row: UnknownRecord): T {
  const a = row as { attributes?: unknown };
  return (a?.attributes && typeof a.attributes === 'object'
    ? (a.attributes as T)
    : (row as T)) as T;
}

/* 1-1/1-many (v4/v5) → array */
function relArray(rel: unknown): UnknownRecord[] {
  if (!rel) return [];
  if (Array.isArray(rel)) return rel as UnknownRecord[];
  if (rel && typeof rel === 'object' && 'data' in rel) {
    const d = (rel as { data?: unknown }).data;
    if (Array.isArray(d)) return d as UnknownRecord[];
    if (d && typeof d === 'object') return [d as UnknownRecord];
  }
  return [];
}

/* 1-1 (v4/v5) → objeto | null */
function relOne(rel: unknown): UnknownRecord | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return (rel[0] as UnknownRecord) ?? null;
  if (rel && typeof rel === 'object' && 'data' in rel) {
    const d = (rel as { data?: unknown }).data;
    if (Array.isArray(d)) return (d[0] as UnknownRecord) ?? null;
    if (d && typeof d === 'object') return d as UnknownRecord;
    return null;
  }
  return rel as UnknownRecord;
}

function hhmm(s?: string | null) {
  if (!s) return '';
  const [H, M] = s.split(':');
  return `${H}:${M}`;
}
function toMinutes(t?: string | null) {
  if (!t) return 0;
  const [H, M] = t.split(':').map(Number);
  return H * 60 + M;
}
function formatDate(iso = new Date().toISOString()) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/* =========================
   Días
   ========================= */
type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
const DAYS: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_ES: Record<Day, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
};

/* =========================
   Sesión de Estudiante
   ========================= */
function getStudentFromStorage():
  | { email?: string; id?: number | string; tokenU?: string }
  | null {
  try {
    const raw = localStorage.getItem('hs_student_session'); // <- guarda esto al loguear
    if (!raw) return null;
    const obj = JSON.parse(raw) as { email?: string; id?: number | string; tokenU?: string };
    return obj ?? null;
  } catch {
    return null;
  }
}

/* =========================
   Fetch JSON (con token)
   ========================= */
async function fetchJSON(url: string, token?: string) {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { cache: 'no-store', headers });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}. ${JSON.stringify(j)}`);
  }
  return res.json();
}

/* =========================
   Consultas
   ========================= */
async function fetchStudentMe(): Promise<UnknownRecord | null> {
  const sess = getStudentFromStorage();
  if (!sess?.email) return null;

  const p = new URLSearchParams();
  p.set('filters[email][$eq]', sess.email);
  p.set('populate[section]', 'true');
  p.set('populate[art_group]', 'true');
  p.set('pagination[pageSize]', '1');

  const url = `${API}/api/students?${p.toString()}`;
  const json = await fetchJSON(url, sess.tokenU);
  const items = parseList(json);
  return items[0] ?? null;
}

async function fetchTimetableBySectionId(sectionId: number) {
  const qs =
    `filters[sections][id][$in]=${encodeURIComponent(String(sectionId))}` +
    `&populate[subject][fields][0]=name` +
    `&populate[subject][fields][1]=shortName` +
    `&populate[subject][fields][2]=color` +
    `&populate[teacher][fields][0]=firstName` +
    `&populate[teacher][fields][1]=lastName` +
    `&pagination[pageSize]=200` +
    `&sort[0]=day:asc` +
    `&sort[1]=startTime:asc`;
  const url = `${API}/api/timetable-entries?${qs}`;
  const json = await fetchJSON(url);
  return parseList(json);
}
async function fetchArtTimetableByGroupId(groupId: number) {
  const qs =
    `filters[art_groups][id][$in]=${encodeURIComponent(String(groupId))}` +
    `&populate[subject][fields][0]=name` +
    `&populate[subject][fields][1]=shortName` +
    `&populate[subject][fields][2]=color` +
    `&populate[teacher][fields][0]=firstName` +
    `&populate[teacher][fields][1]=lastName` +
    `&pagination[pageSize]=200` +
    `&sort[0]=day:asc` +
    `&sort[1]=startTime:asc`;
  const url = `${API}/api/art-timetable-entries?${qs}`;
  const json = await fetchJSON(url);
  return parseList(json);
}

/* =========================
   Grid helpers
   ========================= */
type GridCell = { subject?: string; color?: string | null; teacher?: string; extra?: string };
type GridRow = Record<string, GridCell | null>;
type GridByDay = Record<Day, GridRow>;

function buildSlotsAndGrid(entries: UnknownRecord[]) {
  const slotMap = new Map<string, { period: number | null; start: string | null; end: string | null }>();

  for (const it of entries) {
    const a = body(it);
    const per = (a as AnyObj).period ?? null;
    const start = (a as AnyObj).startTime ?? null;
    const end = (a as AnyObj).endTime ?? null;

    const key =
      start && end ? `time:${start}-${end}` : `period:${per ?? 'NA'}:${start ?? 'NA'}-${end ?? 'NA'}`;

    if (!slotMap.has(key)) slotMap.set(key, { period: per, start, end });
  }

  const slotsArr = Array.from(slotMap.values()).sort((x, y) => {
    const xs = x.start ?? '99:99:99';
    const ys = y.start ?? '99:99:99';
    const cmp = xs.localeCompare(ys);
    if (cmp !== 0) return cmp;
    return (x.period ?? 9999) - (y.period ?? 9999);
  });

  const slots = slotsArr.map(s => ({
    period: s.period ?? null,
    startTime: s.start,
    endTime: s.end,
    minutes: Math.max(0, toMinutes(s.end) - toMinutes(s.start)),
  }));

  const grid: GridByDay = { monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {} };
  return { slots, grid };
}

function SubjectCell({ cell, height }: { cell: GridCell | null; height: number }) {
  if (!cell) {
    return (
      <div className="rounded-md px-2 py-1 text-hughes-blue/60 flex items-center justify-center" style={{ height }}>
        —
      </div>
    );
  }
  return (
    <div
      className="rounded-lg px-3 py-3 flex flex-col justify-center subject-cell"
      style={{ height, background: cell.color || 'var(--hs-yellow, #ffeb99)', color: '#0b1b2b' }}
    >
      <span className="font-semibold text-sm leading-snug">{cell.subject || '—'}</span>
      {(cell.teacher || cell.extra) && (
        <span className="text-[11px] opacity-85 mt-1 leading-tight">
          {[cell.teacher, cell.extra].filter(Boolean).join(' • ')}
        </span>
      )}
    </div>
  );
}

/* =========================
   Página Student Home (estética Parents)
   ========================= */
export default function StudentHomePage() {
  const [activeTab, setActiveTab] = React.useState<'academic' | 'artistic'>('academic');

  const handleExportPDF = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    window.print();
  }, []);

  return (
    <div className="min-h-screen print:bg-white" style={{ background: '#f9f9fb' }}>
      {/* ====== Estilos de impresión (idéntico a Parents) ====== */}
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          html, body { background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          nav, header, footer, .print-hide, .tabs-toolbar, .tab-pill, [data-hide-on-print="true"] { display: none !important; }
          .print-only { display: block !important; }
          .print-page { zoom: 0.83; transform-origin: top left; }
          .print-table { font-size: 11px !important; width: 100% !important; box-shadow: none !important; background: #fff !important; border: 1px solid #ddd !important; }
          .print-table thead { display: table-header-group; }
          .print-table tfoot { display: table-footer-group; }
          .print-table tr, .print-table td, .print-table th { page-break-inside: avoid !important; break-inside: avoid !important; }
          .cell { height: 68px !important; }
          .subject-cell { padding: 8px 10px !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen { .print-only { display: none !important; } }
      `}</style>

      <section className="w-full py-10">
        <div className="mx-auto max-w-7xl px-6 print-page">
          {/* ===== Toolbar (igual que Parents) ===== */}
          <div className="flex items-center justify-between gap-3 print-hide">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-hughes-blue">Student Portal</h1>
              <p className="mt-1 text-hughes-blue/70 text-sm md:text-base">
                Consulte su horario académico y artístico.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm border bg-white hover:bg-slate-50"
                style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)' }}
                aria-label="Exportar horario a PDF"
              >
                <Download size={16} />
                Exportar PDF
              </button>

              <Link
                href="/student/library"
                className="inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold bg-white hover:bg-slate-50"
                style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)' }}
              >
                Library
              </Link>

              <Link
                href="/"
                className="inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold bg-white hover:bg-slate-50"
                style={{ borderColor: '#e2e8f0', color: 'var(--hs-blue)' }}
              >
                Volver al inicio
              </Link>
            </div>
          </div>

          {/* Tabs estilo Parents */}
          <div className="mt-6 tabs-toolbar print-hide">
            <div className="bg-[#ebeaf3] rounded-full p-1 inline-flex gap-1">
              <button
                onClick={() => setActiveTab('academic')}
                className={`tab-pill rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeTab === 'academic'
                    ? 'bg-white text-hughes-blue shadow'
                    : 'text-hughes-blue/80 hover:text-hughes-blue'
                }`}
              >
                Académico
              </button>
              <button
                onClick={() => setActiveTab('artistic')}
                className={`tab-pill rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeTab === 'artistic'
                    ? 'bg-white text-hughes-blue shadow'
                    : 'text-hughes-blue/80 hover:text-hughes-blue'
                }`}
              >
                Artístico
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="mt-6">
            {activeTab === 'academic' ? <AcademicGrid /> : <ArtisticGrid />}
          </div>

          {/* Impresión */}
          <div className="hidden print:block">
            {activeTab === 'academic' ? <AcademicGrid printMode /> : <ArtisticGrid printMode />}
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================
   Grilla Académica
   ========================= */
function AcademicGrid({ printMode = false }: { printMode?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [studentName, setStudentName] = React.useState('');
  const [sectionName, setSectionName] = React.useState('');

  const [slots, setSlots] = React.useState<
    Array<{ period: number | null; startTime: string | null; endTime: string | null; minutes: number }>
  >([]);
  const [grid, setGrid] = React.useState<GridByDay>({ monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {} });

  const CELL_HEIGHT = 84;

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const studentRow = await fetchStudentMe();
        if (!studentRow) { setError('No se encontró sesión del estudiante.'); setLoading(false); return; }
        const sb = body(studentRow);
        setStudentName([sb.firstName, sb.lastName].filter(Boolean).join(' '));

        const secRel = relOne((sb as AnyObj).section);
        const secBody = secRel ? body(secRel) : null;
        const sectionId = (secRel as AnyObj)?.id ?? (secRel as AnyObj)?.documentId ?? null;
        setSectionName((secBody as AnyObj)?.name || '');
        if (!sectionId) { setError('El estudiante no tiene sección asignada.'); setLoading(false); return; }

        const entries = await fetchTimetableBySectionId(Number(sectionId));
        const { slots: s, grid: g } = buildSlotsAndGrid(entries);

        for (const it of entries) {
          const a = body(it);
          const day: Day = (a as AnyObj).day;

          const subj = relOne((a as AnyObj).subject);
          const tch = relOne((a as AnyObj).teacher);
          const subjB = subj ? body(subj) : null;
          const tchB = tch ? body(tch) : null;

          const subjectFull = (subjB as AnyObj)?.name || (subjB as AnyObj)?.shortName || '';
          const teacherFull = [tchB?.firstName, tchB?.lastName].filter(Boolean).join(' ');

          const key =
            (a as AnyObj).startTime && (a as AnyObj).endTime
              ? `time:${(a as AnyObj).startTime}-${(a as AnyObj).endTime}`
              : `period:${(a as AnyObj).period ?? 'NA'}:${(a as AnyObj).startTime ?? 'NA'}-${(a as AnyObj).endTime ?? 'NA'}`;

          g[day][key] = { subject: subjectFull, color: (subjB as AnyObj)?.color || null, teacher: teacherFull };
        }

        setSlots(s); setGrid(g);
      } catch (e: unknown) {
        setError(`No se pudo cargar el horario. ${(e as Error)?.message || e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* Encabezado tarjeta (idéntico Parents) */}
      {!printMode && (
        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: '#ececf4' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-hughes-blue">{studentName || 'Estudiante'}</span>
            {sectionName && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold"
                style={{ background: 'rgba(255,187,0,0.22)', color: 'var(--hs-blue)' }}
              >
                <Tag size={12} />
                {sectionName}
              </span>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border p-6 text-center text-hughes-blue bg-white" style={{ borderColor: '#ececf4' }}>
          Cargando…
        </div>
      )}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[920px] border-collapse text-sm print-table">
            <thead>
              <tr className="bg-slate-100 text-hughes-blue">
                <th className="border-b border-slate-200 p-2 text-left w-[160px]">Hora</th>
                <th className="border-b border-slate-200 p-2 text-center w-[64px]">Min</th>
                <th className="border-b border-slate-200 p-2 text-center w-[76px]">Periodo</th>
                {DAYS.map(d => (
                  <th key={d} className="border-b border-slate-200 p-2 text-left">
                    {DAY_ES[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => {
                const start = hhmm(slot.startTime);
                const end = hhmm(slot.endTime);
                const rowKey =
                  slot.startTime && slot.endTime
                    ? `time:${slot.startTime}-${slot.endTime}`
                    : `period:${slot.period ?? 'NA'}:${slot.startTime ?? 'NA'}-${slot.endTime ?? 'NA'}`;
                return (
                  <tr key={`${rowKey}-${idx}`} className="odd:bg-white even:bg-slate-50/40">
                    <td className="p-2 font-medium text-hughes-blue cell" style={{ height: CELL_HEIGHT }}>
                      {start && end ? `${start} - ${end}` : '—'}
                    </td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>
                      {slot.minutes || '—'}
                    </td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>
                      {slot.period ?? '—'}
                    </td>
                    {DAYS.map(d => (
                      <td key={d} className="p-1 cell" style={{ height: CELL_HEIGHT }}>
                        <SubjectCell cell={grid[d][rowKey]} height={CELL_HEIGHT - 8} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* =========================
   Grilla Artística
   ========================= */
function ArtisticGrid({ printMode = false }: { printMode?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [studentName, setStudentName] = React.useState('');
  const [groupName, setGroupName] = React.useState('');

  const [slots, setSlots] = React.useState<
    Array<{ period: number | null; startTime: string | null; endTime: string | null; minutes: number }>
  >([]);
  const [grid, setGrid] = React.useState<GridByDay>({ monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {} });

  const CELL_HEIGHT = 84;

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const studentRow = await fetchStudentMe();
        if (!studentRow) { setError('No se encontró sesión del estudiante.'); setLoading(false); return; }
        const sb = body(studentRow);
        setStudentName([sb.firstName, sb.lastName].filter(Boolean).join(' '));

        const agRel = relOne((sb as AnyObj).art_group ?? (sb as AnyObj).artGroup);
        const agBody = agRel ? body(agRel) : null;
        const groupId = (agRel as AnyObj)?.id ?? (agRel as AnyObj)?.documentId ?? null;
        setGroupName((agBody as AnyObj)?.name || '');
        if (!groupId) { setError('El estudiante no tiene grupo artístico asignado.'); setLoading(false); return; }

        const entries = await fetchArtTimetableByGroupId(Number(groupId));
        const { slots: s, grid: g } = buildSlotsAndGrid(entries);

        for (const it of entries) {
          const a = body(it);
          const day: Day = (a as AnyObj).day;

          const subj = relOne((a as AnyObj).subject);
          const tch = relOne((a as AnyObj).teacher);
          const subjB = subj ? body(subj) : null;
          const tchB = tch ? body(tch) : null;

          const subjectFull = (subjB as AnyObj)?.name || (subjB as AnyObj)?.shortName || '';
          const teacherFull = [tchB?.firstName, tchB?.lastName].filter(Boolean).join(' ');

          const key =
            (a as AnyObj).startTime && (a as AnyObj).endTime
              ? `time:${(a as AnyObj).startTime}-${(a as AnyObj).endTime}`
              : `period:${(a as AnyObj).period ?? 'NA'}:${(a as AnyObj).startTime ?? 'NA'}-${(a as AnyObj).endTime ?? 'NA'}`;

          g[day][key] = { subject: subjectFull, color: (subjB as AnyObj)?.color || null, teacher: teacherFull };
        }

        setSlots(s); setGrid(g);
      } catch (e: unknown) {
        setError(`No se pudo cargar el horario artístico. ${(e as Error)?.message || e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* Encabezado tarjeta (idéntico Parents) */}
      {!printMode && (
        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: '#ececf4' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-hughes-blue">{studentName || 'Estudiante'}</span>
            {groupName && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold"
                style={{ background: 'rgba(255,187,0,0.22)', color: 'var(--hs-blue)' }}
              >
                <Tag size={12} />
                {groupName}
              </span>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border p-6 text-center text-hughes-blue bg-white" style={{ borderColor: '#ececf4' }}>
          Cargando…
        </div>
      )}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[920px] border-collapse text-sm print-table">
            <thead>
              <tr className="bg-slate-100 text-hughes-blue">
                <th className="border-b border-slate-200 p-2 text-left w-[160px]">Hora</th>
                <th className="border-b border-slate-200 p-2 text-center w-[64px]">Min</th>
                <th className="border-b border-slate-200 p-2 text-center w-[76px]">Periodo</th>
                {DAYS.map(d => (
                  <th key={d} className="border-b border-slate-200 p-2 text-left">
                    {DAY_ES[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => {
                const start = hhmm(slot.startTime);
                const end = hhmm(slot.endTime);
                const rowKey =
                  slot.startTime && slot.endTime
                    ? `time:${slot.startTime}-${slot.endTime}`
                    : `period:${slot.period ?? 'NA'}:${slot.startTime ?? 'NA'}-${slot.endTime ?? 'NA'}`;
                return (
                  <tr key={`${rowKey}-${idx}`} className="odd:bg-white even:bg-slate-50/40">
                    <td className="p-2 font-medium text-hughes-blue cell" style={{ height: CELL_HEIGHT }}>
                      {start && end ? `${start} - ${end}` : '—'}
                    </td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>
                      {slot.minutes || '—'}
                    </td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>
                      {slot.period ?? '—'}
                    </td>
                    {DAYS.map(d => (
                      <td key={d} className="p-1 cell" style={{ height: CELL_HEIGHT }}>
                        <SubjectCell cell={grid[d][rowKey]} height={CELL_HEIGHT - 8} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
