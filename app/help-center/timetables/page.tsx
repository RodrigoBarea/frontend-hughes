/* eslint-disable @typescript-eslint/no-explicit-any */
// app/help-center/timetables/page.tsx
"use client";

import * as React from "react";
import ParentsPortalNav from "@/components/parents/ParentsPortalNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Tag, Download } from "lucide-react";

const BRAND = { blue: "var(--hs-blue)", yellow: "var(--hs-yellow)" };
const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";

/* ─────────── Utils (tolerante v4/v5) ─────────── */
type AnyObj = Record<string, any>;
function parseList<T = AnyObj>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object" && "data" in json) {
    const data = (json as any).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}
function body<T = AnyObj>(row: AnyObj): T {
  return (row?.attributes && typeof row.attributes === "object" ? row.attributes : row) as T;
}
function relArray(rel: any): AnyObj[] {
  if (!rel) return [];
  if (Array.isArray(rel)) return rel;
  if (rel && typeof rel === "object" && "data" in rel) {
    const d = rel.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === "object") return [d];
  }
  return [];
}
function relOne(rel: any): AnyObj | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  if (rel && typeof rel === "object" && "data" in rel) {
    const d = rel.data;
    if (Array.isArray(d)) return d[0] ?? null;
    if (d && typeof d === "object") return d;
    return null;
  }
  return rel as AnyObj;
}
function hhmm(s?: string | null) {
  if (!s) return "";
  const [H, M] = s.split(":");
  return `${H}:${M}`;
}
function toMinutes(t?: string | null) {
  if (!t) return 0;
  const [H, M] = t.split(":").map(Number);
  return H * 60 + M;
}
function formatDate(iso = new Date().toISOString()) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/* ─────────── Días ─────────── */
type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
const DAY_ES: Record<Day, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
};
const DAYS: Day[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];

/* ─────────── Storage ─────────── */
function getParentFromStorage(): { email?: string; id?: number | string; tokenU?: string } | null {
  try {
    const a = localStorage.getItem("hs_parent_session");
    const b = localStorage.getItem("hs_parent");
    const pA = a ? JSON.parse(a) : {};
    const pB = b ? JSON.parse(b) : {};
    return { email: pA?.email || pB?.email, id: pA?.id ?? pB?.id, tokenU: pA?.tokenU };
  } catch {
    return null;
  }
}

/* ─────────── Fetchers ─────────── */
async function fetchJSON(url: string, token?: string) {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { cache: "no-store", headers });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}. ${JSON.stringify(j)}`);
  }
  return res.json();
}

/* populate estudiante: sección + grupo artístico (v5) */
function qParentByEmail(email: string) {
  const p = new URLSearchParams();
  p.set("filters[email][$eq]", email);
  p.set("populate[students][populate][section]", "true");
  p.set("populate[students][populate][art_group]", "true");
  p.set("pagination[pageSize]", "1");
  return `${API}/api/parents?${p.toString()}`;
}
function qParentById(id: number | string) {
  const p = new URLSearchParams();
  p.set("filters[id][$eq]", String(id));
  p.set("populate[students][populate][section]", "true");
  p.set("populate[students][populate][art_group]", "true");
  p.set("pagination[pageSize]", "1");
  return `${API}/api/parents?${p.toString()}`;
}
async function fetchParent(): Promise<AnyObj | null> {
  const sess = getParentFromStorage();
  if (!sess) return null;
  const urls: string[] = [];
  if (sess.id !== undefined && sess.id !== null && String(sess.id) !== "") urls.push(qParentById(sess.id as any));
  if (sess.email) urls.push(qParentByEmail(sess.email));
  try {
    const raw = localStorage.getItem("hs_parent");
    const obj = raw ? JSON.parse(raw) : null;
    if (obj?.email && obj.email !== sess.email) urls.push(qParentByEmail(obj.email));
  } catch {}
  for (const u of urls) {
    try {
      const json = await fetchJSON(u, sess.tokenU);
      const items = parseList(json);
      if (items[0]) return items[0];
    } catch {}
  }
  return null;
}

/* Académico: por sección */
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

/* Artístico: por grupo (manyToMany = art_groups) */
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

/* ─────────── Página ─────────── */
export default function TimetablesPage() {
  const [tab, setTab] = React.useState<"academic" | "artistic" | "teachers">("academic");

  const handleExportPDF = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
    window.print();
  }, []);

  return (
    <div className="min-h-screen print:bg-white" style={{ background: "#f9f9fb" }}>
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          html, body {
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, footer,
          .print-hide, .tabs-toolbar, .tab-pill,
          [data-hide-on-print="true"] { display: none !important; }
          .print-only { display: block !important; }
          .print-page { zoom: 0.83; transform-origin: top left; }
          .print-table { font-size: 11px !important; }
          .cell { height: 68px !important; }
          .subject-cell { padding: 8px 10px !important; }
          .print-table {
            width: 100% !important; box-shadow: none !important;
            background: #fff !important; border: 1px solid #ddd !important;
          }
          .print-table thead { display: table-header-group; }
          .print-table tfoot { display: table-footer-group; }
          .print-table tr, .print-table td, .print-table th { page-break-inside: avoid !important; break-inside: avoid !important; }
          .subject-cell { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen { .print-only { display: none !important; } }
      `}</style>

      <ParentsPortalNav data-hide-on-print="true" />

      <section className="w-full py-10">
        <div className="mx-auto max-w-7xl px-6 print-page">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 print-hide">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-hughes-blue">Horarios</h1>
              <p className="mt-1 text-hughes-blue/70 text-sm md:text-base">
                Consulte los horarios del estudiante y del personal docente.
              </p>
            </div>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm border bg-white hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0", color: "var(--hs-blue)" }}
              aria-label="Exportar horario a PDF"
            >
              <Download size={16} />
              Exportar PDF
            </button>
          </div>

          {/* Header de impresión */}
          <div className="print-only mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/Logo%20Transparente.png" alt="Hughes Schools" width={56} height={56} style={{ objectFit: "contain" }} />
                <div className="text-lg font-bold">Hughes Schools — Horario</div>
              </div>
              <div className="text-sm" style={{ color: "var(--hs-blue)" }}>{formatDate()}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 tabs-toolbar" data-hide-on-print="true">
            <Tabs defaultValue="academic" className="w-full" onValueChange={(v) => setTab(v as any)}>
              <TabsList className="bg-[#ebeaf3] rounded-full p-1 max-w-full flex gap-1">
                <TabsTrigger value="academic" className="tab-pill rounded-full">Académico</TabsTrigger>
                <TabsTrigger value="artistic" className="tab-pill rounded-full">Artístico</TabsTrigger>
                <TabsTrigger value="teachers" className="tab-pill rounded-full">Profesores</TabsTrigger>
              </TabsList>

              <TabsContent value="academic" className="mt-6">
                <AcademicGrid />
              </TabsContent>

              <TabsContent value="artistic" className="mt-6">
                <ArtisticGrid />
              </TabsContent>

              <TabsContent value="teachers" className="mt-6">
                <TeacherGrid />
              </TabsContent>
            </Tabs>
          </div>

          {/* Impresión: renderiza la pestaña activa */}
          <div className="hidden print:block">
            {tab === "academic" ? <AcademicGrid printMode /> :
             tab === "artistic" ? <ArtisticGrid printMode /> :
             <TeacherGrid printMode />}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────── Tipos y helpers de grilla ─────────── */
type GridCell = { subject?: string; color?: string | null; teacher?: string; extra?: string };
type GridRow = Record<string, GridCell | null>;               // claves string (evita ts2741)
type GridByDay = Record<Day, GridRow>;

function buildSlotsAndGrid(entries: AnyObj[]) {
  // Slot único: si hay horas, usamos "time:start-end", si no, un fallback con period incluido
  const slotMap = new Map<string, { period: number | null; start: string | null; end: string | null }>();

  for (const it of entries) {
    const a = body(it);
    const per: number | null = a.period ?? null;
    const start = a.startTime ?? null;
    const end = a.endTime ?? null;

    const key =
      (start && end)
        ? `time:${start}-${end}`
        : `period:${per ?? "NA"}:${start ?? "NA"}-${end ?? "NA"}`;

    if (!slotMap.has(key)) slotMap.set(key, { period: per, start, end });
  }

  const slotsArr = Array.from(slotMap.values()).sort((x, y) => {
    const xs = x.start ?? "99:99:99";
    const ys = y.start ?? "99:99:99";
    const cmp = xs.localeCompare(ys);
    if (cmp !== 0) return cmp;
    return (x.period ?? 9999) - (y.period ?? 9999);
  });

  const slots = slotsArr.map((s) => ({
    period: s.period ?? null,
    startTime: s.start,
    endTime: s.end,
    minutes: Math.max(0, toMinutes(s.end) - toMinutes(s.start)),
  }));

  const grid: GridByDay = {
    monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {},
  };

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
      style={{ height, background: cell.color || "var(--hs-yellow, #ffeb99)", color: "#0b1b2b" }}
    >
      <span className="font-semibold text-sm leading-snug">{cell.subject || "—"}</span>
      {(cell.teacher || cell.extra) && (
        <span className="text-[11px] opacity-85 mt-1 leading-tight">
          {[cell.teacher, cell.extra].filter(Boolean).join(" • ")}
        </span>
      )}
    </div>
  );
}

/* ─────────── Grilla ACADÉMICA ─────────── */
function AcademicGrid({ printMode = false }: { printMode?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [students, setStudents] = React.useState<Array<{ id: number; row: AnyObj }>>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const [studentName, setStudentName] = React.useState("");
  const [sectionName, setSectionName] = React.useState("");

  const [slots, setSlots] = React.useState<Array<{ period: number | null; startTime: string | null; endTime: string | null; minutes: number }>>([]);
  const [grid, setGrid] = React.useState<GridByDay>({ monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {} });

  const CELL_HEIGHT = 84;

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const parentRow = await fetchParent();
        if (!parentRow) { setError("Padre no encontrado."); setLoading(false); return; }
        const studs = relArray(body(parentRow).students);
        if (studs.length === 0) { setError("Este padre no tiene estudiantes vinculados."); setLoading(false); return; }
        const list = studs.map((s) => ({ id: Number(s?.id ?? s?.documentId ?? 0), row: s }));
        setStudents(list); setSelectedId(list[0]?.id ?? null);
      } catch (e: any) { setError(`No se pudo cargar el horario. ${e?.message || e}`); }
      finally { setLoading(false); }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!selectedId) return;
      setLoading(true); setError(null);
      try {
        const sItem = students.find((x) => x.id === selectedId);
        if (!sItem) return;

        const sBody = body(sItem.row);
        setStudentName([sBody.firstName, sBody.lastName].filter(Boolean).join(" "));
        const sectionRel = relOne(sBody.section);
        const secBody = sectionRel ? body(sectionRel) : null;
        const sectionId = sectionRel?.id ?? sectionRel?.documentId ?? null;
        setSectionName(secBody?.name || "");
        if (!sectionId) { setError("El estudiante no tiene sección asignada."); setLoading(false); return; }

        const entries = await fetchTimetableBySectionId(Number(sectionId));
        const { slots: s, grid: g } = buildSlotsAndGrid(entries);

        for (const it of entries) {
          const a = body(it);
          const day: Day = a.day;
          const per: number | null = a.period ?? null;

          const subj = relOne(a.subject); const tch = relOne(a.teacher);
          const subjB = subj ? body(subj) : null; const tchB = tch ? body(tch) : null;

          const subjectFull = subjB?.name || subjB?.shortName || "";
          const teacherFull = [tchB?.firstName, tchB?.lastName].filter(Boolean).join(" ");

          const key = (a.startTime && a.endTime)
            ? `time:${a.startTime}-${a.endTime}`
            : `period:${per ?? "NA"}:${a.startTime ?? "NA"}-${a.endTime ?? "NA"}`;

          g[day][key] = { subject: subjectFull, color: subjB?.color || null, teacher: teacherFull };
        }

        setSlots(s); setGrid(g);
      } catch (e: any) { setError(`No se pudo cargar el horario. ${e?.message || e}`); }
      finally { setLoading(false); }
    })();
  }, [selectedId, students]);

  return (
    <>
      {!printMode && (
        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm print-hide" style={{ borderColor: "#ececf4" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <User size={18} style={{ color: BRAND.blue }} />
            {students.length > 1 ? (
              <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))} className="rounded-md border px-2 py-1 text-sm">
                {students.map((s) => { const sb = body(s.row); return <option key={s.id} value={s.id}>{`${sb.firstName ?? ""} ${sb.lastName ?? ""}`.trim()}</option>; })}
              </select>
            ) : (<span className="font-semibold text-hughes-blue">{studentName || "Estudiante"}</span>)}
            {sectionName && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: "rgba(255,187,0,0.22)", color: BRAND.blue }}>
                <Tag size={12} />{sectionName}
              </span>
            )}
          </div>
        </div>
      )}

      {printMode && <div className="print-only mb-2"><div className="text-base font-semibold">{[studentName, sectionName].filter(Boolean).join(" • ")}</div></div>}

      {loading && <div className="rounded-xl border p-6 text-center text-hughes-blue bg-white print-container" style={{ borderColor: "#ececf4" }}>Cargando…</div>}
      {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 print-container" role="alert">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm print-container">
          <table className="w-full min-w-[920px] border-collapse text-sm print-table">
            <thead>
              <tr className="bg-slate-100 text-hughes-blue">
                <th className="border-b border-slate-200 p-2 text-left w-[160px]">Hora</th>
                <th className="border-b border-slate-200 p-2 text-center w-[64px]">Min</th>
                <th className="border-b border-slate-200 p-2 text-center w-[76px]">Periodo</th>
                {DAYS.map((d) => <th key={d} className="border-b border-slate-200 p-2 text-left">{DAY_ES[d]}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => {
                const start = hhmm(slot.startTime); const end = hhmm(slot.endTime);
                const rowKey = (slot.startTime && slot.endTime)
                  ? `time:${slot.startTime}-${slot.endTime}`
                  : `period:${slot.period ?? "NA"}:${slot.startTime ?? "NA"}-${slot.endTime ?? "NA"}`;
                return (
                  <tr key={`${rowKey}-${idx}`} className="odd:bg-white even:bg-slate-50/40">
                    <td className="p-2 font-medium text-hughes-blue cell" style={{ height: CELL_HEIGHT }}>{start && end ? `${start} - ${end}` : "—"}</td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>{slot.minutes || "—"}</td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>{slot.period ?? "—"}</td>
                    {DAYS.map((d) => <td key={d} className="p-1 cell" style={{ height: CELL_HEIGHT }}><SubjectCell cell={grid[d][rowKey]} height={CELL_HEIGHT - 8} /></td>)}
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

/* ─────────── Grilla ARTÍSTICA ─────────── */
function ArtisticGrid({ printMode = false }: { printMode?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [students, setStudents] = React.useState<Array<{ id: number; row: AnyObj }>>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const [studentName, setStudentName] = React.useState("");
  const [groupName, setGroupName] = React.useState("");

  const [slots, setSlots] = React.useState<Array<{ period: number | null; startTime: string | null; endTime: string | null; minutes: number }>>([]);
  const [grid, setGrid] = React.useState<GridByDay>({ monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {} });

  const CELL_HEIGHT = 84;

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const parentRow = await fetchParent();
        if (!parentRow) { setError("Padre no encontrado."); setLoading(false); return; }
        const studs = relArray(body(parentRow).students);
        if (studs.length === 0) { setError("Este padre no tiene estudiantes vinculados."); setLoading(false); return; }
        const list = studs.map((s) => ({ id: Number(s?.id ?? s?.documentId ?? 0), row: s }));
        setStudents(list); setSelectedId(list[0]?.id ?? null);
      } catch (e: any) { setError(`No se pudo cargar el horario. ${e?.message || e}`); }
      finally { setLoading(false); }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!selectedId) return;
      setLoading(true); setError(null);
      try {
        const sItem = students.find((x) => x.id === selectedId);
        if (!sItem) return;

        const sBody = body(sItem.row);
        setStudentName([sBody.firstName, sBody.lastName].filter(Boolean).join(" "));

        const agRel = relOne((sBody as any).art_group ?? (sBody as any).artGroup);
        const agBody = agRel ? body(agRel) : null;
        const groupId = agRel?.id ?? agRel?.documentId ?? null;
        setGroupName(agBody?.name || "");
        if (!groupId) { setError("El estudiante no tiene grupo artístico asignado."); setLoading(false); return; }

        const entries = await fetchArtTimetableByGroupId(Number(groupId));
        const { slots: s, grid: g } = buildSlotsAndGrid(entries);

        for (const it of entries) {
          const a = body(it);
          const day: Day = a.day;

          const subj = relOne(a.subject); const tch = relOne(a.teacher);
          const subjB = subj ? body(subj) : null; const tchB = tch ? body(tch) : null;

          const subjectFull = subjB?.name || subjB?.shortName || "";
          const teacherFull = [tchB?.firstName, tchB?.lastName].filter(Boolean).join(" ");

          const key = (a.startTime && a.endTime)
            ? `time:${a.startTime}-${a.endTime}`
            : `period:${a.period ?? "NA"}:${a.startTime ?? "NA"}-${a.endTime ?? "NA"}`;

          g[day][key] = { subject: subjectFull, color: subjB?.color || null, teacher: teacherFull };
        }

        setSlots(s); setGrid(g);
      } catch (e: any) { setError(`No se pudo cargar el horario artístico. ${e?.message || e}`); }
      finally { setLoading(false); }
    })();
  }, [selectedId, students]);

  return (
    <>
      {!printMode && (
        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm print-hide" style={{ borderColor: "#ececf4" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <User size={18} style={{ color: BRAND.blue }} />
            {students.length > 1 ? (
              <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))} className="rounded-md border px-2 py-1 text-sm">
                {students.map((s) => { const sb = body(s.row); return <option key={s.id} value={s.id}>{`${sb.firstName ?? ""} ${sb.lastName ?? ""}`.trim()}</option>; })}
              </select>
            ) : (<span className="font-semibold text-hughes-blue">{studentName || "Estudiante"}</span>)}
            {groupName && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: "rgba(255,187,0,0.22)", color: BRAND.blue }}>
                <Tag size={12} />{groupName}
              </span>
            )}
          </div>
        </div>
      )}

      {printMode && <div className="print-only mb-2"><div className="text-base font-semibold">{[studentName, groupName].filter(Boolean).join(" • ")}</div></div>}

      {loading && <div className="rounded-xl border p-6 text-center text-hughes-blue bg-white print-container" style={{ borderColor: "#ececf4" }}>Cargando…</div>}
      {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 print-container" role="alert">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm print-container">
          <table className="w-full min-w-[920px] border-collapse text-sm print-table">
            <thead>
              <tr className="bg-slate-100 text-hughes-blue">
                <th className="border-b border-slate-200 p-2 text-left w-[160px]">Hora</th>
                <th className="border-b border-slate-200 p-2 text-center w-[64px]">Min</th>
                <th className="border-b border-slate-200 p-2 text-center w-[76px]">Periodo</th>
                {DAYS.map((d) => <th key={d} className="border-b border-slate-200 p-2 text-left">{DAY_ES[d]}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => {
                const start = hhmm(slot.startTime); const end = hhmm(slot.endTime);
                const rowKey = (slot.startTime && slot.endTime)
                  ? `time:${slot.startTime}-${slot.endTime}`
                  : `period:${slot.period ?? "NA"}:${slot.startTime ?? "NA"}-${slot.endTime ?? "NA"}`;
                return (
                  <tr key={`${rowKey}-${idx}`} className="odd:bg-white even:bg-slate-50/40">
                    <td className="p-2 font-medium text-hughes-blue cell" style={{ height: CELL_HEIGHT }}>{start && end ? `${start} - ${end}` : "—"}</td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>{slot.minutes || "—"}</td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>{slot.period ?? "—"}</td>
                    {DAYS.map((d) => <td key={d} className="p-1 cell" style={{ height: CELL_HEIGHT }}><SubjectCell cell={grid[d][rowKey]} height={CELL_HEIGHT - 8} /></td>)}
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

/* ─────────── Grilla PROFESORES ─────────── */
function TeacherGrid({ printMode = false }: { printMode?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [studentName, setStudentName] = React.useState("");
  const [sectionName, setSectionName] = React.useState("");
  const [groupName, setGroupName] = React.useState("");

  const [teachers, setTeachers] = React.useState<Array<{ id: string | number; name: string }>>([]);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string | number | null>(null);

  const [slots, setSlots] = React.useState<Array<{ period: number | null; startTime: string | null; endTime: string | null; minutes: number }>>([]);
  const [grid, setGrid] = React.useState<GridByDay>({ monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {} });

  const CELL_HEIGHT = 84;

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const parentRow = await fetchParent();
        if (!parentRow) { setError("Padre no encontrado."); setLoading(false); return; }
        const p = body(parentRow);
        const students = relArray(p.students);
        if (students.length === 0) { setError("Este padre no tiene estudiantes vinculados."); setLoading(false); return; }

        const s = students[0];
        const sb = body(s);
        setStudentName([sb.firstName, sb.lastName].filter(Boolean).join(" "));

        const secRel = relOne(sb.section); const secBody = secRel ? body(secRel) : null;
        const sectionId = secRel?.id ?? secRel?.documentId ?? null; setSectionName(secBody?.name || "");

        const agRel = relOne((sb as any).art_group ?? (sb as any).artGroup); const agBody = agRel ? body(agRel) : null;
        const groupId = agRel?.id ?? agRel?.documentId ?? null; setGroupName(agBody?.name || "");

        const [acad, art] = await Promise.all([
          sectionId ? fetchTimetableBySectionId(Number(sectionId)) : Promise.resolve([]),
          groupId ? fetchArtTimetableByGroupId(Number(groupId)) : Promise.resolve([]),
        ]);

        const tmap = new Map<string | number, string>();
        const pushT = (it: AnyObj) => {
          const a = body(it);
          const tch = relOne(a.teacher); if (!tch) return;
          const id = tch.id ?? tch.documentId; const tb = body(tch);
          const name = [tb?.firstName, tb?.lastName].filter(Boolean).join(" ");
          if (id != null && name) tmap.set(id, name);
        };
        acad.forEach(pushT); art.forEach(pushT);

        const tlist = Array.from(tmap.entries()).map(([id, name]) => ({ id, name })).sort((x, y) => x.name.localeCompare(y.name));
        setTeachers(tlist); setSelectedTeacherId(tlist[0]?.id ?? null);

        (window as any).__HS_sources = { acad, art, sectionName: secBody?.name || "", groupName: agBody?.name || "" };
      } catch (e: any) { setError(`No se pudo cargar los profesores. ${e?.message || e}`); }
      finally { setLoading(false); }
    })();
  }, []);

  React.useEffect(() => {
    const ctx = (window as any).__HS_sources as { acad: AnyObj[]; art: AnyObj[]; sectionName: string; groupName: string } | undefined;
    if (!ctx || selectedTeacherId == null) return;

    const entriesForTeacher: Array<AnyObj & { __kind: "acad" | "art" }> = [];

    const pick = (arr: AnyObj[], kind: "acad" | "art") => {
      for (const it of arr) {
        const a = body(it);
        const tch = relOne(a.teacher); if (!tch) continue;
        const id = tch.id ?? tch.documentId;
        if (String(id) === String(selectedTeacherId)) {
          (entriesForTeacher as any).push({ ...it, __kind: kind });
        }
      }
    };
    pick(ctx.acad, "acad"); pick(ctx.art, "art");

    const { slots: s, grid: g } = buildSlotsAndGrid(entriesForTeacher);

    for (const it of entriesForTeacher) {
      const a = body(it);
      const day: Day = a.day;

      const subj = relOne(a.subject); const tch = relOne(a.teacher);
      const subjB = subj ? body(subj) : null; const tchB = tch ? body(tch) : null;

      const subjectFull = subjB?.name || subjB?.shortName || "";
      const teacherFull = [tchB?.firstName, tchB?.lastName].filter(Boolean).join(" ");

      const key = (a.startTime && a.endTime)
        ? `time:${a.startTime}-${a.endTime}`                // <-- evita colisiones AM/PM
        : `period:${a.period ?? "NA"}:${a.startTime ?? "NA"}-${a.endTime ?? "NA"}`;

      const extra = (it as any).__kind === "acad"
        ? (ctx.sectionName ? `Sección: ${ctx.sectionName}` : "")
        : (ctx.groupName ? `Grupo: ${ctx.groupName}` : "");

      g[day][key] = { subject: subjectFull, color: subjB?.color || null, teacher: teacherFull, extra };
    }

    setSlots(s); setGrid(g);
  }, [selectedTeacherId]);

  return (
    <>
      {!printMode && (
        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm print-hide" style={{ borderColor: "#ececf4" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <User size={18} style={{ color: BRAND.blue }} />
            <span className="font-semibold text-hughes-blue">{studentName || "Estudiante"}</span>

            <div className="flex items-center gap-2">
              <span className="text-sm text-hughes-blue/70">Profesor:</span>
              <select
                value={selectedTeacherId ?? ""}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
              >
                {teachers.map((t) => (
                  <option key={String(t.id)} value={String(t.id)}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {printMode && selectedTeacherId != null && (
        <div className="print-only mb-2">
          <div className="text-base font-semibold">
            {["Profesor", teachers.find(t => String(t.id) === String(selectedTeacherId))?.name].filter(Boolean).join(": ")}
          </div>
        </div>
      )}

      {loading && <div className="rounded-xl border p-6 text-center text-hughes-blue bg-white print-container" style={{ borderColor: "#ececf4" }}>Cargando…</div>}
      {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 print-container" role="alert">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm print-container">
          <table className="w-full min-w-[920px] border-collapse text-sm print-table">
            <thead>
              <tr className="bg-slate-100 text-hughes-blue">
                <th className="border-b border-slate-200 p-2 text-left w-[160px]">Hora</th>
                <th className="border-b border-slate-200 p-2 text-center w-[64px]">Min</th>
                <th className="border-b border-slate-200 p-2 text-center w-[76px]">Periodo</th>
                {DAYS.map((d) => <th key={d} className="border-b border-slate-200 p-2 text-left">{DAY_ES[d]}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => {
                const start = hhmm(slot.startTime); const end = hhmm(slot.endTime);
                const rowKey = (slot.startTime && slot.endTime)
                  ? `time:${slot.startTime}-${slot.endTime}`
                  : `period:${slot.period ?? "NA"}:${slot.startTime ?? "NA"}-${slot.endTime ?? "NA"}`;
                return (
                  <tr key={`${rowKey}-${idx}`} className="odd:bg-white even:bg-slate-50/40">
                    <td className="p-2 font-medium text-hughes-blue cell" style={{ height: CELL_HEIGHT }}>{start && end ? `${start} - ${end}` : "—"}</td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>{slot.minutes || "—"}</td>
                    <td className="p-2 text-center cell" style={{ height: CELL_HEIGHT }}>{slot.period ?? "—"}</td>
                    {DAYS.map((d) => <td key={d} className="p-1 cell" style={{ height: CELL_HEIGHT }}><SubjectCell cell={grid[d][rowKey]} height={CELL_HEIGHT - 8} /></td>)}
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
