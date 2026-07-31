import {
  CalendarPlus,
  CalendarCheck,
  Wrench,
  FileText,
} from "lucide-react";
import type { ActivityEvent } from "@/src/lib/admin/dashboard-data";

const ICONS = {
  reservation_new: CalendarPlus,
  reservation_finished: CalendarCheck,
  maintenance: Wrench,
  document: FileText,
} as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ActivityList({
  events,
}: {
  events: ActivityEvent[];
}) {
  if (events.length === 0) {
    return <p className="de-empty">Aucune activité récente</p>;
  }

  return (
    <div className="de-list">
      {events.map((event) => {
        const Icon = ICONS[event.type];

        return (
          <div key={event.id} className="de-list-item">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--blue-border)] bg-[var(--bg)]">
                <Icon size={16} strokeWidth={1.75} className="text-[var(--blue-soft)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{event.title}</p>
                  <time className="text-xs de-muted">{formatDate(event.date)}</time>
                </div>
                {event.description && (
                  <p className="mt-0.5 text-sm de-muted">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
