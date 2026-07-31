"use client";

import { useState } from "react";
import ReservationListPanel from "./reservation-list";
import ReservationsCalendar from "./reservations-calendar";
import type {
  ReservationListItem,
  ReservationStats,
} from "@/src/lib/admin/reservations-types";

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

export default function ReservationsPanel({
  items,
  stats,
}: {
  items: ReservationListItem[];
  stats: ReservationStats;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  const finishedItems = items.filter((item) => item.status === "finished");

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="de-card-inner">
          <p className="de-label">À venir</p>
          <p className="de-stat-value mt-1 text-lg">{stats.upcoming}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">En cours</p>
          <p className="de-stat-value mt-1 text-lg">{stats.current}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Terminées</p>
          <p className="de-stat-value mt-1 text-lg">{stats.finished}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Revenus générés</p>
          <p className="de-stat-value mt-1 text-lg text-[var(--blue-soft)]">
            {formatEuro(stats.totalRevenue)}
          </p>
        </div>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`de-btn de-btn-tab ${view === "list" ? "de-btn-tab--active" : "de-btn-tab--inactive"}`}
        >
          Liste
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={`de-btn de-btn-tab ${view === "calendar" ? "de-btn-tab--active" : "de-btn-tab--inactive"}`}
        >
          Calendrier
        </button>
      </div>

      {view === "list" ? (
        <ReservationListPanel reservations={items} />
      ) : (
        <ReservationsCalendar reservations={items} />
      )}

      <div className="space-y-3">
        <h3 className="de-section-label">Historique</h3>
        <div className="de-card de-card-padded space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="de-card-inner">
              <p className="de-label">Locations terminées</p>
              <p className="mt-1 text-lg font-medium">{stats.finished}</p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Part propriétaires</p>
              <p className="mt-1 text-lg font-medium">
                {formatEuro(stats.ownerShare)}
              </p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Commission DreamEffect</p>
              <p className="mt-1 text-lg font-medium text-[var(--blue-soft)]">
                {formatEuro(stats.companyShare)}
              </p>
            </div>
          </div>

          {finishedItems.length === 0 ? (
            <p className="de-empty">Aucune réservation terminée</p>
          ) : (
            <div className="de-list">
              {finishedItems.slice(0, 8).map((reservation) => (
                <a
                  key={reservation.id}
                  href={`/admin/reservations/${reservation.id}`}
                  className="de-list-item block"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize">
                      {reservation.vehicle_label} — {reservation.customer_name}
                    </p>
                    <p className="text-sm text-[var(--blue-soft)]">
                      {formatEuro(reservation.total_price)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
