/* eslint-disable @typescript-eslint/no-explicit-any */
// app/help-center/forms/page.tsx
"use client";

import * as React from "react";
import ParentsPortalNav from "@/components/parents/ParentsPortalNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Info, Send, XCircle } from "lucide-react";

/* ─────────── Config ─────────── */
const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
const TARGET_YEAR = "2026";

/* ─────────── Utils tolerantes v4/v5 ─────────── */
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
function relOne(rel: any): AnyObj | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  if (rel && typeof rel === "object" && "data" in rel) {
    const d = rel.data;
    if (Array.isArray(d)) return d[0] ?? null;
    if (d && typeof d === "object") return d;
  }
  return rel as AnyObj;
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

/* ─────────── Storage sesión padre ─────────── */
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

/* ─────────── Fetch base ─────────── */
async function fetchJSON(url: string, token?: string, init?: RequestInit) {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

/* ─────────── Queries Strapi ─────────── */
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
  for (const u of urls) {
    try {
      const json = await fetchJSON(u, sess?.tokenU);
      const items = parseList(json);
      if (items[0]) return items[0];
    } catch {}
  }
  return null;
}

/* Horarios para juntar materias (académico + artístico) */
async function fetchSectionEntries(sectionId: number) {
  const p = new URLSearchParams();
  p.set("filters[sections][id][$in]", String(sectionId));
  p.set("populate[subject][fields][0]", "name");
  p.set("populate[subject][fields][1]", "shortName");
  p.set("populate[subject][fields][2]", "color");
  p.set("pagination[pageSize]", "200");
  const url = `${API}/api/timetable-entries?${p.toString()}`;
  const json = await fetchJSON(url);
  return parseList(json);
}
async function fetchGroupEntries(groupId: number) {
  const p = new URLSearchParams();
  p.set("filters[art_groups][id][$in]", String(groupId));
  p.set("populate[subject][fields][0]", "name");
  p.set("populate[subject][fields][1]", "shortName");
  p.set("populate[subject][fields][2]", "color");
  p.set("pagination[pageSize]", "200");
  const url = `${API}/api/art-timetable-entries?${p.toString()}`;
  const json = await fetchJSON(url);
  return parseList(json);
}

/* Reservas existentes (para bloquear el formulario si ya respondió) */
async function fetchExistingSeatReservation(studentId: number | string, year: string) {
  const p = new URLSearchParams();
  p.set("filters[student][id][$eq]", String(studentId));
  p.set("filters[schoolYear][$eq]", year);
  p.set("pagination[pageSize]", "1");
  p.set("sort[0]", "createdAt:desc");
  const url = `${API}/api/seat-reservations?${p.toString()}`;
  const json = await fetchJSON(url);
  const list = parseList(json);
  return list[0] ?? null;
}

/* ─────────── Página ─────────── */
export default function HelpCenterFormsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f9f9fb" }}>
      <ParentsPortalNav />

      <section className="w-full py-10">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-hughes-blue">
            Formularios
          </h1>
          <p className="mt-1 text-hughes-blue/70">
            Gestione reservas de plaza y solicitudes de licencia.
          </p>

          <div className="mt-6">
            <Tabs defaultValue="seat" className="w-full">
              <TabsList className="bg-[#ebeaf3] rounded-full p-1">
                <TabsTrigger value="seat" className="tab-pill rounded-full">Reserva de plaza</TabsTrigger>
                <TabsTrigger value="leave" className="tab-pill rounded-full">Solicitud de licencia</TabsTrigger>
              </TabsList>

              <TabsContent value="seat" className="mt-6">
                <SeatReservationForm />
              </TabsContent>

              <TabsContent value="leave" className="mt-6">
                <LeaveRequestForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Reserva de plaza (gestión 2026 + bloqueo si ya respondió)
   ────────────────────────────────────────────────────────── */
function SeatReservationForm() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [parent, setParent] = React.useState<AnyObj | null>(null);
  const [student, setStudent] = React.useState<AnyObj | null>(null);
  const [sectionName, setSectionName] = React.useState("");

  const [existing, setExisting] = React.useState<AnyObj | null>(null); // reserva ya enviada (2026)

  const [confirm, setConfirm] = React.useState<"SI" | "NO" | "">("");

  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<"ok" | "err" | "">("");

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const p = await fetchParent();
        if (!p) { setError("No se pudo leer la sesión del padre."); setLoading(false); return; }
        setParent(p);
        const studs = relArray(body(p).students);
        if (studs.length === 0) { setError("No hay estudiantes vinculados."); setLoading(false); return; }
        const st = studs[0];
        setStudent(st);
        const sec = relOne(body(st).section);
        setSectionName(sec ? body(sec).name || "" : "");

        // ¿Ya existe reserva 2026 para este estudiante?
        const stId = st.id ?? (st as any).documentId;
        if (stId) {
          const ex = await fetchExistingSeatReservation(stId, TARGET_YEAR);
          setExisting(ex);
        }
      } catch (e: any) { setError(e?.message || String(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parent || !student || !confirm) return;

    setSubmitting(true); setDone(""); setError(null);
    try {
      const sess = getParentFromStorage();
      const payload = {
        data: {
          parent: (parent.id ?? (parent as any).documentId) ?? null,      // relation
          student: (student.id ?? (student as any).documentId) ?? null,   // relation
          sectionName,
          schoolYear: TARGET_YEAR,
          confirm, // "SI" | "NO"
        },
      };
      await fetchJSON(`${API}/api/seat-reservations`, sess?.tokenU, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setDone("ok");
      // refrescar "existing" para bloquear luego del envío
      const stId = student.id ?? (student as any).documentId;
      if (stId) {
        const ex = await fetchExistingSeatReservation(stId, TARGET_YEAR);
        setExisting(ex);
      }
    } catch (e: any) {
      setDone("err");
      setError(e?.message || "No se pudo enviar.");
    } finally {
      setSubmitting(false);
    }
  }

  const sBody = student ? body(student) : {};

  // Si ya hay una reserva para 2026 → mostrar mensaje y NO el formulario
  if (!loading && !error && existing) {
    const ex = body(existing);
    const when = ex.createdAt ? new Date(ex.createdAt).toLocaleString() : "";
    const badgeColor = ex.confirm === "SI" ? "#16a34a" : "#dc2626";
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#ececf4" }}>
        <h3 className="text-xl font-bold text-hughes-blue">Reserva de plaza — Gestión {TARGET_YEAR}</h3>

        <div className="mt-4 rounded-xl border p-4 bg-slate-50" style={{ borderColor: "#e2e8f0" }}>
          <p className="flex items-center gap-2 text-hughes-blue">
            <Info size={18} /> <strong>El estudiante ya confirmó su plaza.</strong>
          </p>
          <div className="mt-3 text-hughes-blue/90 space-y-1">
            <div>
              <span className="inline-flex items-center gap-2">
                <span className="text-sm">Estado:</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: badgeColor }}>
                  {ex.confirm}
                </span>
              </span>
            </div>
            <div>Estudiante: {[sBody.firstName, sBody.lastName].filter(Boolean).join(" ")}</div>
            {sectionName && <div>Sección: {sectionName}</div>}
            {when && <div>Fecha de respuesta: {when}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#ececf4" }}>
      <h3 className="text-xl font-bold text-hughes-blue">Reserva de plaza — Gestión {TARGET_YEAR}</h3>

      {loading && <p className="mt-4 text-hughes-blue/70">Cargando…</p>}
      {!loading && error && <p className="mt-4 text-red-600">{error}</p>}

      {!loading && !error && (
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          {/* Resumen estudiante */}
          <div className="rounded-xl border p-4" style={{ borderColor: "#ececf4" }}>
            <p className="text-sm text-hughes-blue/70">Estudiante</p>
            <p className="text-hughes-blue font-semibold">
              {[sBody.firstName, sBody.lastName].filter(Boolean).join(" ")}
            </p>
            {sectionName && (
              <p className="text-sm text-hughes-blue/80">Sección: {sectionName}</p>
            )}
          </div>

          {/* Pregunta principal */}
          <fieldset>
            <legend className="mb-2 block font-semibold text-hughes-blue">
              Confirma la plaza de su hijo/a en la gestión {TARGET_YEAR}?
              <span className="text-red-600"> *</span>
            </legend>
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2">
                <input
                  required
                  type="radio"
                  name="confirm"
                  value="SI"
                  checked={confirm === "SI"}
                  onChange={() => setConfirm("SI")}
                />
                <span>SI</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  required
                  type="radio"
                  name="confirm"
                  value="NO"
                  checked={confirm === "NO"}
                  onChange={() => setConfirm("NO")}
                />
                <span>NO</span>
              </label>
            </div>
          </fieldset>

          {/* Estados */}
          {done === "ok" && (
            <p className="flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle2 size={16} /> ¡Gracias! Hemos recibido su respuesta.
            </p>
          )}
          {done === "err" && (
            <p className="flex items-center gap-2 text-red-700 text-sm">
              <XCircle size={16} /> {error || "No se pudo enviar."}
            </p>
          )}

          <div className="flex justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[var(--hs-yellow)] px-5 py-2 font-semibold text-hughes-blue disabled:opacity-50"
              disabled={submitting}
            >
              <Send size={16} />
              {submitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Solicitud de licencia (sin cambios funcionales)
   ────────────────────────────────────────────────────────── */
function LeaveRequestForm() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [parent, setParent] = React.useState<AnyObj | null>(null);
  const [student, setStudent] = React.useState<AnyObj | null>(null);
  const [sectionName, setSectionName] = React.useState("");
  const [groupName, setGroupName] = React.useState("");

  const [mode, setMode] = React.useState<"full" | "partial">("full");

  const [dateStart, setDateStart] = React.useState("");
  const [dateEnd, setDateEnd] = React.useState("");

  const [datePartial, setDatePartial] = React.useState("");
  const [subjects, setSubjects] = React.useState<string[]>([]);
  const [allSubjects, setAllSubjects] = React.useState<Array<{ id: string; name: string }>>([]);

  const [reason, setReason] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<"ok" | "err" | "">("");

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const p = await fetchParent();
        if (!p) { setError("No se pudo leer la sesión del padre."); setLoading(false); return; }
        setParent(p);

        const studs = relArray(body(p).students);
        if (studs.length === 0) { setError("No hay estudiantes vinculados."); setLoading(false); return; }
        const st = studs[0];
        setStudent(st);

        const sec = relOne(body(st).section);
        setSectionName(sec ? body(sec).name || "" : "");

        const ag = relOne(body(st).art_group ?? (body(st) as any).artGroup);
        setGroupName(ag ? body(ag).name || "" : "");

        // Cargar materias (académicas + artísticas) para la opción "parcial"
        const sectionId = sec?.id ?? sec?.documentId ?? null;
        const groupId = ag?.id ?? ag?.documentId ?? null;

        const [acad, art] = await Promise.all([
          sectionId ? fetchSectionEntries(Number(sectionId)) : Promise.resolve([]),
          groupId ? fetchGroupEntries(Number(groupId)) : Promise.resolve([]),
        ]);

        const names = new Set<string>();
        const pushNames = (arr: AnyObj[]) => {
          for (const it of arr) {
            const sRel = relOne(body(it).subject);
            const name = sRel ? (body(sRel).name || body(sRel).shortName || "") : "";
            if (name) names.add(name);
          }
        };
        pushNames(acad); pushNames(art);

        const list = Array.from(names).sort().map((n, i) => ({ id: String(i + 1), name: n }));
        setAllSubjects(list);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggleSubject(name: string) {
    setSubjects((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parent || !student) return;

    // Validaciones simples
    if (mode === "full" && (!dateStart || !dateEnd)) {
      setError("Complete el rango de fechas de la licencia.");
      return;
    }
    if (mode === "partial" && (!datePartial || subjects.length === 0)) {
      setError("Seleccione fecha y al menos una materia.");
      return;
    }

    setSubmitting(true); setDone(""); setError(null);
    try {
      const sess = getParentFromStorage();
      const payload: AnyObj = {
        data: {
          parent: (parent.id ?? (parent as any).documentId) ?? null,
          student: (student.id ?? (student as any).documentId) ?? null,
          sectionName,
          artGroupName: groupName || null,
          reason: reason || null,
          type: mode === "full" ? "full-day" : "partial",
        },
      };

      if (mode === "full") {
        payload.data.dateStart = dateStart;
        payload.data.dateEnd = dateEnd;
      } else {
        payload.data.datePartial = datePartial;
        payload.data.subjects = subjects; // arreglo de strings
      }

      await fetchJSON(`${API}/api/leave-requests`, sess?.tokenU, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setDone("ok");
      // limpiar
      setReason("");
      setDateStart(""); setDateEnd("");
      setDatePartial(""); setSubjects([]);
      setMode("full");
    } catch (e: any) {
      setDone("err");
      setError(e?.message || "No se pudo enviar.");
    } finally {
      setSubmitting(false);
    }
  }

  const pBody = parent ? body(parent) : {};
  const sBody = student ? body(student) : {};

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#ececf4" }}>
      <h3 className="text-xl font-bold text-hughes-blue">Solicitud de licencia</h3>

      {loading && <p className="mt-4 text-hughes-blue/70">Cargando…</p>}
      {!loading && error && <p className="mt-4 text-red-600">{error}</p>}

      {!loading && !error && (
        <form onSubmit={onSubmit} className="mt-5 space-y-6">
          {/* Resumen padre + alumno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ borderColor: "#ececf4" }}>
              <p className="text-sm text-hughes-blue/70">Padre/Madre/Tutor</p>
              <p className="text-hughes-blue font-semibold">{pBody.fullName || pBody.email}</p>
              <p className="text-sm text-hughes-blue/80">{pBody.email || ""}</p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: "#ececf4" }}>
              <p className="text-sm text-hughes-blue/70">Estudiante</p>
              <p className="text-hughes-blue font-semibold">
                {[sBody.firstName, sBody.lastName].filter(Boolean).join(" ")}
              </p>
              {sectionName && <p className="text-sm text-hughes-blue/80">Sección: {sectionName}</p>}
              {groupName && <p className="text-sm text-hughes-blue/80">Grupo artístico: {groupName}</p>}
            </div>
          </div>

          {/* Tipo de licencia */}
          <fieldset>
            <legend className="mb-2 block font-semibold text-hughes-blue">Tipo de licencia</legend>
            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="full"
                  checked={mode === "full"}
                  onChange={() => setMode("full")}
                />
                <span>Días completos</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="partial"
                  checked={mode === "partial"}
                  onChange={() => setMode("partial")}
                />
                <span>Parcial (menos de un día)</span>
              </label>
            </div>
          </fieldset>

          {/* Rango de fechas o Fecha + Materias */}
          {mode === "full" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-hughes-blue">Desde *</label>
                <input
                  required
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-hughes-blue">Hasta *</label>
                <input
                  required
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-hughes-blue">Fecha *</label>
                <input
                  required
                  type="date"
                  value={datePartial}
                  onChange={(e) => setDatePartial(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-hughes-blue">Materias *</label>
                {allSubjects.length === 0 ? (
                  <p className="mt-2 text-sm text-hughes-blue/70">No se encontraron materias para el estudiante.</p>
                ) : (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allSubjects.map((s) => (
                      <label key={s.id} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: "#ececf4" }}>
                        <input
                          type="checkbox"
                          checked={subjects.includes(s.name)}
                          onChange={() => toggleSubject(s.name)}
                        />
                        <span>{s.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Motivo opcional */}
          <div>
            <label className="block text-sm font-semibold text-hughes-blue">Motivo (opcional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border px-3 py-2"
              placeholder="Breve explicación de la licencia…"
            />
          </div>

          {/* Estados */}
          {done === "ok" && (
            <p className="flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle2 size={16} /> ¡Solicitud enviada!
            </p>
          )}
          {done === "err" && (
            <p className="flex items-center gap-2 text-red-700 text-sm">
              <XCircle size={16} /> {error || "No se pudo enviar."}
            </p>
          )}

          <div className="flex justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[var(--hs-yellow)] px-5 py-2 font-semibold text-hughes-blue disabled:opacity-50"
              disabled={submitting}
            >
              <Send size={16} />
              {submitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
