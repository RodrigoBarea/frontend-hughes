// app/events/page.tsx
import EventsClient from "./EventsClient";
import type { EventType } from "./EventsClient";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const rawType = Array.isArray(sp?.type) ? sp.type[0] : sp?.type;
  const initialType: EventType =
    rawType === "Academic" || rawType === "Artistic" || rawType === "Extracurricular"
      ? rawType
      : "All";

  const rawPage = Array.isArray(sp?.page) ? sp.page[0] : sp?.page;
  const n = Number.parseInt(rawPage ?? "1", 10);
  const initialPage = Number.isFinite(n) && n > 0 ? n : 1;

  return <EventsClient initialType={initialType} initialPage={initialPage} />;
}
