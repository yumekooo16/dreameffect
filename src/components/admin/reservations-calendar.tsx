"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  getReservationDisplayStatus,
  getReservationStatusLabel,
} from "@/src/lib/reservations/status";
import type { ReservationListItem } from "@/src/lib/admin/reservations-types";

function isDateInRange(date: Date, start: string, end: string) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
}

function daysInRange(start: string, end: string) {
  const days: Date[] = [];
  const current = new Date(start);
  const last = new Date(end);
  current.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export default function ReservationsCalendar({
  reservations,
}: {
  reservations: ReservationListItem[];
}) {
  const [selected, setSelected] = useState<Date | undefined>();

  const activeReservations = useMemo(
    () => reservations.filter((r) => r.status !== "cancelled"),
    [reservations]
  );

  const modifiers = useMemo(() => {
    const pending: Date[] = [];
    const confirmed: Date[] = [];
    const inProgress: Date[] = [];
    const finished: Date[] = [];

    for (const reservation of activeReservations) {
      const days = daysInRange(reservation.start_date, reservation.end_date);
      const displayStatus = getReservationDisplayStatus(reservation);

      for (const day of days) {
        if (displayStatus === "pending") pending.push(day);
        else if (displayStatus === "confirmed") confirmed.push(day);
        else if (displayStatus === "in_progress") inProgress.push(day);
        else if (displayStatus === "finished") finished.push(day);
      }
    }

    return { pending, confirmed, inProgress, finished };
  }, [activeReservations]);

  const dayReservations = useMemo(() => {
    if (!selected) return [];
    return activeReservations.filter((r) =>
      isDateInRange(selected, r.start_date, r.end_date)
    );
  }, [selected, activeReservations]);

  return (
    <div className="de-calendar">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={setSelected}
        modifiers={modifiers}
        modifiersClassNames={{
          pending: "cal-pending",
          confirmed: "cal-confirmed",
          inProgress: "cal-in-progress",
          finished: "cal-finished",
        }}
      />

      <div className="de-calendar-legend flex-wrap">
        <span className="legend-cal-pending">En attente</span>
        <span className="legend-cal-confirmed">Confirmée</span>
        <span className="legend-cal-in-progress">En cours</span>
        <span className="legend-cal-finished">Terminée</span>
      </div>

      {selected && (
        <div className="de-calendar-detail mt-4">
          <p className="de-label mb-3">
            {selected.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {dayReservations.length === 0 ? (
            <p className="de-empty">Aucune location ce jour</p>
          ) : (
            <div className="de-list">
              {dayReservations.map((reservation) => (
                <Link
                  key={reservation.id}
                  href={`/admin/reservations/${reservation.id}`}
                  className="de-list-item block transition hover:border-[var(--blue-soft)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize">
                      {reservation.vehicle_label}
                    </p>
                    <span className="de-badge de-badge--confirmed">
                      {getReservationStatusLabel(reservation)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs de-muted">
                    {reservation.customer_name ?? "Client"} ·{" "}
                    {reservation.owner_name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
