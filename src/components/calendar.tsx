"use client";

import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  getReservationDisplayStatus,
  getReservationStatusLabel,
} from "@/src/lib/reservations/status";

type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  customer_name?: string | null;
  status: string;
  total_price?: number | null;
  owner_amount?: number | null;
  distance_km?: number | null;
};

type Maintenance = {
  id: string;
  maintenance_date?: string | null;
  title: string;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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

export default function Calendar({
  reservations,
  maintenances,
}: {
  reservations: Reservation[];
  maintenances: Maintenance[];
}) {
  const [selected, setSelected] = useState<Date | undefined>();

  const maintenanceDays = useMemo(
    () =>
      maintenances
        .filter((m) => m.maintenance_date)
        .map((m) => new Date(m.maintenance_date!)),
    [maintenances]
  );

  const visibleReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status !== "cancelled"),
    [reservations]
  );

  const modifiers = useMemo(() => {
    const pending: Date[] = [];
    const confirmed: Date[] = [];
    const inProgress: Date[] = [];
    const finished: Date[] = [];

    for (const reservation of visibleReservations) {
      const days = daysInRange(reservation.start_date, reservation.end_date);
      const displayStatus = getReservationDisplayStatus(reservation);

      for (const day of days) {
        if (displayStatus === "pending") pending.push(day);
        else if (displayStatus === "confirmed") confirmed.push(day);
        else if (displayStatus === "in_progress") inProgress.push(day);
        else if (displayStatus === "finished") finished.push(day);
      }
    }

    return { pending, confirmed, inProgress, finished, maintenance: maintenanceDays };
  }, [visibleReservations, maintenanceDays]);

  const dayReservations = useMemo(() => {
    if (!selected) return [];
    return visibleReservations.filter((r) =>
      isDateInRange(new Date(selected), r.start_date, r.end_date)
    );
  }, [selected, visibleReservations]);

  const dayMaintenances = useMemo(() => {
    if (!selected) return [];
    return maintenances.filter(
      (m) =>
        m.maintenance_date &&
        isSameDay(new Date(m.maintenance_date), selected)
    );
  }, [selected, maintenances]);

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
          maintenance: "maintenance",
        }}
      />

      <div className="de-calendar-legend flex-wrap">
        <span className="legend-cal-pending">En attente</span>
        <span className="legend-cal-confirmed">Confirmée</span>
        <span className="legend-cal-in-progress">En cours</span>
        <span className="legend-cal-finished">Terminée</span>
        <span className="legend-maintenance">Entretien</span>
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

          {dayReservations.length === 0 && dayMaintenances.length === 0 ? (
            <p className="de-empty">Aucune activité ce jour</p>
          ) : (
            <div className="de-list">
              {dayReservations.map((reservation) => (
                <div key={reservation.id} className="de-list-item space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">Réservation</p>
                    <span className="de-badge de-badge--confirmed">
                      {getReservationStatusLabel(reservation)}
                    </span>
                  </div>
                  <p className="text-xs de-muted">
                    {new Date(reservation.start_date).toLocaleDateString("fr-FR")}
                    {" → "}
                    {new Date(reservation.end_date).toLocaleDateString("fr-FR")}
                  </p>
                  {reservation.customer_name && (
                    <p className="text-xs de-muted">{reservation.customer_name}</p>
                  )}
                  {(reservation.owner_amount != null ||
                    reservation.total_price != null) && (
                    <p className="text-sm font-medium text-[var(--blue-soft)]">
                      {(
                        reservation.owner_amount ??
                        reservation.total_price ??
                        0
                      ).toLocaleString("fr-FR")}{" "}
                      €
                    </p>
                  )}
                  {reservation.status === "finished" &&
                    reservation.distance_km != null && (
                      <p className="text-xs de-muted">
                        {reservation.distance_km.toLocaleString("fr-FR")} km
                        parcourus
                      </p>
                    )}
                </div>
              ))}

              {dayMaintenances.map((item) => (
                <div key={item.id} className="de-list-item space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <span className="de-badge de-badge--pending">Entretien</span>
                  </div>
                  {item.maintenance_date && (
                    <p className="text-xs de-muted">
                      {new Date(item.maintenance_date).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
