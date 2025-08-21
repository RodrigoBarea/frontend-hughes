"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
  parseISO,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─────────── Tipos & helpers ─────────── */

type EventV5 = {
  id: number | string;
  title?: string;
  start?: string;
  end?: string | null;
  location?: string | null;
  tipo?: string | null;
};

type EventV4 = {
  id: number | string;
  attributes?: {
    title?: string;
    start?: string;
    end?: string | null;
    location?: string | null;
    tipo?: string | null;
  };
};

type EventRow = EventV4 | EventV5;

export type EventItem = {
  id: number | string;
  title: string;
  start: string;
  end: string | null;
  location: string | null;
  tipo: string | null;
};

function getAttr<T>(
  row: EventRow,
  key: keyof NonNullable<EventV4["attributes"]>
): T | undefined {
  if ((row as Record<string, unknown>)[key] !== undefined) {
    return (row as Record<string, unknown>)[key] as T; // v5
  }
  const attrs = (row as EventV4).attributes as
    | Record<string, unknown>
    | undefined; // v4
  if (attrs && attrs[key] !== undefined) {
    return attrs[key] as T;
  }
  return undefined;
}

const TIPO_COLORS: Record<
  string,
  { bg: string; text: string; border: string; soft: string }
> = {
  Academic: { bg: "#cde36a", text: "#0b1229", border: "#b4cc55", soft: "rgba(205,227,106,0.12)" },
  Administrative: { bg: "#ffd966", text: "#0b1229", border: "#f2c84f", soft: "rgba(255,217,102,0.12)" },
  Holiday: { bg: "#ff4b4b", text: "#ffffff", border: "#e14444", soft: "rgba(255,75,75,0.10)" },
  Dance: { bg: "#22c1f1", text: "#0b1229", border: "#16a7d3", soft: "rgba(34,193,241,0.12)" },
  Music: { bg: "#f2f542", text: "#0b1229", border: "#dbde34", soft: "rgba(242,245,66,0.12)" },
  Trimester: { bg: "#5dd39e", text: "#0b1229", border: "#49bb8a", soft: "rgba(93,211,158,0.12)" },
  Other: { bg: "#cfcfd9", text: "#0b1229", border: "#bdbdc9", soft: "rgba(207,207,217,0.12)" },
};

function colorFor(tipo?: string | null) {
  if (!tipo) return TIPO_COLORS.Other;
  return TIPO_COLORS[tipo] || TIPO_COLORS.Other;
}

function formatISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function includesDay(ev: EventItem, day: Date) {
  const s = parseISO(ev.start);
  const e = parseISO(ev.end ?? ev.start);
  const d0 = new Date(day);
  d0.setHours(0, 0, 0, 0);
  const s0 = new Date(s);
  s0.setHours(0, 0, 0, 0);
  const e0 = new Date(e);
  e0.setHours(23, 59, 59, 999);
  return !(d0 < s0 || d0 > e0);
}

/* ─────────── Fetch a Strapi ─────────── */

async function fetchEventsByRange(
  startDate: Date,
  endDate: Date
): Promise<EventItem[]> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";

  const startISO = formatISO(startDate);
  const endISO = formatISO(endDate);

  const params = new URLSearchParams({
    "filters[$and][0][start][$lte]": endISO,
    "filters[$and][1][$or][0][end][$gte]": startISO,
    "filters[$and][1][$or][1][end][$null]": "true",
    sort: "start:asc",
    "pagination[pageSize]": "200",
    "fields[0]": "title",
    "fields[1]": "start",
    "fields[2]": "end",
    "fields[3]": "location",
    "fields[4]": "tipo",
  });

  const res = await fetch(`${base}/api/events?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as { data?: EventRow[] } | EventRow[];
  const rows: EventRow[] = Array.isArray(json) ? json : json?.data ?? [];

  const items: EventItem[] = rows.map((row) => {
    const title =
      (getAttr<string>(row, "title") ?? (row as EventV5).title ?? "").toString();
    const start = getAttr<string>(row, "start") ?? (row as EventV5).start ?? "";
    let end =
      getAttr<string | null>(row, "end") ?? (row as EventV5).end ?? null;
    end = end ?? start;

    const location =
      getAttr<string | null>(row, "location") ??
      (row as EventV5).location ??
      null;
    const tipo =
      getAttr<string | null>(row, "tipo") ?? (row as EventV5).tipo ?? null;

    return { id: (row as any).id, title, start, end, location, tipo };
  });

  return items;
}

/* ─────────── UI helpers ─────────── */

function HSBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: "#fff4cc", color: "#0b1229", border: "1px solid #ffe38c" }}
    >
      {children}
    </div>
  );
}

function HSNavButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold hover:bg-white"
      style={{ borderColor: "#ececf4", color: "var(--hs-blue)" }}
    >
      {children}
    </button>
  );
}

function FilterChip({
  label,
  active,
  onToggle,
  color,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  color: ReturnType<typeof colorFor>;
}) {
  return (
    <button
      onClick={onToggle}
      className="rounded-full border px-3 py-1 text-xs font-semibold transition"
      style={{
        borderColor: active ? color.border : "#e6e6f0",
        background: active ? color.bg : "white",
        color: active ? color.text : "var(--hs-blue)",
      }}
    >
      {label}
    </button>
  );
}

/* ─────────── List View ─────────── */

function ListView({ events }: { events: EventItem[] }) {
  if (events.length === 0) {
    return (
      <div
        className="rounded-2xl border bg-white p-8 text-center text-hughes-blue shadow-[0_10px_45px_-20px_rgba(17,6,49,0.35)]"
        style={{ borderColor: "#ececf4" }}
      >
        No events for this month.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((ev) => {
        const c = colorFor(ev.tipo);
        const oneDay = ev.start === (ev.end ?? ev.start);
        const dayLabel = oneDay
          ? format(parseISO(ev.start), "MMM d, yyyy", { locale: enUS })
          : `${format(parseISO(ev.start), "MMM d", { locale: enUS })}–${format(
              parseISO(ev.end ?? ev.start),
              "MMM d, yyyy",
              { locale: enUS }
            )}`;

        return (
          <div
            key={ev.id}
            className="relative rounded-2xl border bg-white p-4 md:p-5 text-hughes-blue shadow-[0_10px_45px_-20px_rgba(17,6,49,0.35)]"
            style={{ borderColor: "#ececf4" }}
          >
            <span
              className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl"
              style={{ background: c.border }}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-start md:items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
                    {ev.title}
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background: c.bg,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    {ev.tipo ?? "Other"}
                  </span>
                </div>
                <div className="mt-1 text-sm text-hughes-blue/80">
                  {dayLabel}
                  {ev.location ? ` • ${ev.location}` : ""}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── Month View (arreglado responsive móvil) ─────────── */

function MonthView({
  monthDate,
  events,
}: {
  monthDate: Date;
  events: EventItem[];
}) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const MAX_VISIBLE = 3;

  const toggleDay = (key: string) =>
    setExpandedDays((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div
      className="rounded-2xl border bg-white p-2 md:p-4 shadow-[0_10px_45px_-20px_rgba(17,6,49,0.35)]"
      style={{ borderColor: "#ececf4" }}
    >
      <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-[12px] font-semibold text-hughes-blue/70">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const dayKey = format(day, "yyyy-MM-dd");
          const allEvents = events.filter((ev) => includesDay(ev, day));
          const expanded = !!expandedDays[dayKey];
          const visibleEvents = expanded
            ? allEvents
            : allEvents.slice(0, MAX_VISIBLE);
          const remaining = Math.max(0, allEvents.length - visibleEvents.length);

          const cellSoft =
            allEvents.length > 0
              ? colorFor(allEvents[0].tipo).soft
              : inMonth
              ? "white"
              : "#fafafb";

          return (
            <div
              key={day.toISOString()}
              className="min-h-[110px] md:min-h-[120px] rounded-xl border p-1.5 md:p-2 overflow-visible"
              style={{
                borderColor: "#ececf4",
                background: cellSoft,
                opacity: inMonth ? 1 : 0.9,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-hughes-blue">
                  {format(day, "d")}
                </div>
              </div>

              <div className="mt-1 space-y-1.5">
                {visibleEvents.map((ev) => {
                  const c = colorFor(ev.tipo);
                  const oneDay = ev.start === (ev.end ?? ev.start);
                  const dateText = oneDay
                    ? format(parseISO(ev.start), "MMM d, yyyy", { locale: enUS })
                    : `${format(parseISO(ev.start), "MMM d", { locale: enUS })}–${format(
                        parseISO(ev.end ?? ev.start),
                        "MMM d, yyyy",
                        { locale: enUS }
                      )}`;

                  return (
                    <div key={`${ev.id}-${ev.start}`} className="relative group">
                      {/* BLOQUE del evento (móvil: columna; desktop: igual) */}
                      <div
                        className="w-full rounded-md px-2 py-2 text-[12px] md:text-[13px] font-semibold leading-[1.25] break-words whitespace-normal"
                        style={{
                          background: c.bg,
                          color: c.text,
                          border: `2px solid ${c.border}`,
                          minHeight: "70px",
                        }}
                      >
                        {/* Título (máx 2 líneas) */}
                        <div
                          className="line-clamp-2"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {ev.title}
                        </div>

                        {/* Pie del bloque: chip + meta  (en móvil en columna para que no se desborde) */}
                        <div className="mt-1 flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold shrink-0"
                            style={{
                              background: "rgba(255,255,255,0.9)",
                              color: c.text,
                              border: `1px solid ${c.border}`,
                            }}
                          >
                            {ev.tipo ?? "Other"}
                          </span>
                          <span className="md:hidden text-[11px] opacity-85">
                            {dateText}
                            {ev.location ? ` • ${ev.location}` : ""}
                          </span>
                        </div>
                      </div>

                      {/* Hover card (solo md+) */}
                      <div
                        className="pointer-events-none absolute z-20 hidden w-64 md:w-72 rounded-xl border bg-white p-3 text-[12px] shadow-xl md:group-hover:block"
                        style={{
                          top: "100%",
                          left: 0,
                          marginTop: "8px",
                          borderColor: "#ececf4",
                          color: "var(--hs-blue)",
                        }}
                      >
                        <div className="text-sm font-semibold mb-1">{ev.title}</div>
                        <div className="opacity-80">{dateText}</div>
                        {ev.location && (
                          <div className="opacity-80">📍 {ev.location}</div>
                        )}
                        {ev.tipo && (
                          <div
                            className="mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px]"
                            style={{
                              borderColor: c.border,
                              background: c.bg,
                              color: c.text,
                            }}
                          >
                            {ev.tipo}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {remaining > 0 && !expanded && (
                  <button
                    onClick={() => toggleDay(dayKey)}
                    className="w-full rounded-md border px-2 py-1 text-[12px] font-semibold text-hughes-blue hover:bg-white"
                    style={{ borderColor: "#e6e6f0", background: "rgba(255,255,255,0.65)" }}
                  >
                    +{remaining} more
                  </button>
                )}
                {expanded && allEvents.length > MAX_VISIBLE && (
                  <button
                    onClick={() => toggleDay(dayKey)}
                    className="w-full rounded-md border px-2 py-1 text-[12px] font-semibold text-hughes-blue hover:bg-white"
                    style={{ borderColor: "#e6e6f0", background: "rgba(255,255,255,0.65)" }}
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Página ─────────── */

export default function CalendarPage() {
  const [view, setView] = useState<"month" | "list">("month");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const allTypeKeys = useMemo(() => Object.keys(TIPO_COLORS), []);
  const [activeTypes, setActiveTypes] = useState<string[]>(allTypeKeys);
  const toggleType = (t: string) =>
    setActiveTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const list = await fetchEventsByRange(start, end);
        if (!cancelled) setEvents(list);
      } catch (e: unknown) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentMonth]);

  const monthEvents = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const filtered = events
      .filter((ev) => activeTypes.includes(ev.tipo ?? "Other"))
      .filter((ev) => {
        const s = parseISO(ev.start);
        const e = parseISO(ev.end ?? ev.start);
        return !(e < start || s > end);
      });
    return filtered.sort(
      (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
    );
  }, [events, currentMonth, activeTypes]);

  const title = format(currentMonth, "MMMM yyyy", { locale: enUS });

  return (
    <main className="min-h-screen" style={{ background: "#f5f6fb" }}>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
          <HSBadge>Calendar 2025 · Schedule</HSBadge>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-hughes-blue">
                Hughes Schools Yearly Calendar
              </h1>
              <p className="mt-2 text-hughes-blue/80">
                Browse month by month. Filter by view and quickly scan the activities of our
                community.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <HSNavButton onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </HSNavButton>
              <div className="mx-2 text-lg md:text-xl font-bold text-hughes-blue">
                {title}
              </div>
              <HSNavButton onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
                Next
                <ChevronRight className="h-4 w-4" />
              </HSNavButton>
            </div>
          </div>

          {/* Filtros por tipo */}
          <div className="mt-6 flex flex-wrap gap-2">
            {allTypeKeys.map((t) => {
              const c = colorFor(t);
              const active = activeTypes.includes(t);
              return (
                <FilterChip
                  key={t}
                  label={t}
                  active={active}
                  onToggle={() => toggleType(t)}
                  color={c}
                />
              );
            })}
          </div>

          {/* Tabs List / Month */}
          <div className="mt-6">
            <Tabs
              value={view === "month" ? "Month" : "List"}
              onValueChange={(v) => setView(v === "Month" ? "month" : "list")}
              className="w-full"
            >
              <TabsList className="mx-auto grid w-full max-w-sm grid-cols-2 rounded-full bg-[#ebeaf3] p-1">
                <TabsTrigger
                  value="List"
                  className="rounded-full px-6 py-2 text-sm font-semibold data-[state=active]:bg-[var(--hs-yellow)] data-[state=active]:text-hughes-blue"
                >
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="Month"
                  className="rounded-full px-6 py-2 text-sm font-semibold data-[state=active]:bg-[var(--hs-yellow)] data-[state=active]:text-hughes-blue"
                >
                  Month
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {loading ? (
                  <div
                    className="rounded-2xl border bg-white p-8 text-center text-hughes-blue shadow-[0_10px_45px_-20px_rgba(17,6,49,0.35)]"
                    style={{ borderColor: "#ececf4" }}
                  >
                    Loading events…
                  </div>
                ) : err ? (
                  <div
                    className="rounded-2xl border bg-white p-8 text-center text-hughes-blue shadow-[0_10px_45px_-20px_rgba(17,6,49,0.35)]"
                    style={{ borderColor: "#ececf4" }}
                  >
                    Error loading events: {err}
                  </div>
                ) : (
                  <>
                    <TabsContent value="List" className="mt-0">
                      <ListView events={monthEvents} />
                    </TabsContent>
                    <TabsContent value="Month" className="mt-0">
                      <MonthView monthDate={currentMonth} events={monthEvents} />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </section>
    </main>
  );
}
