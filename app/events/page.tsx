// app/events/page.tsx
import { Suspense } from "react";
import EventsClient from "./EventsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando eventos…</div>}>
      <EventsClient />
    </Suspense>
  );
}
