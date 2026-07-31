"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  getReservationDisplayStatus,
  getReservationStatusBadgeClass,
  getReservationStatusLabel,
  RESERVATION_STATUS_FILTERS,
} from "@/src/lib/reservations/status";
import type { ReservationListItem } from "@/src/lib/admin/reservations-types";
import { formatDistanceKm } from "@/src/lib/admin/reservations-types";

type StatusFilter = (typeof RESERVATION_STATUS_FILTERS)[number]["value"];

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReservationListPanel({
  reservations,
}: {
  reservations: ReservationListItem[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const displayStatus = getReservationDisplayStatus(reservation);

      if (statusFilter !== "all" && displayStatus !== statusFilter) {
        return false;
      }

      if (periodStart) {
        const start = new Date(periodStart);
        if (new Date(reservation.end_date) < start) return false;
      }

      if (periodEnd) {
        const end = new Date(periodEnd);
        end.setHours(23, 59, 59, 999);
        if (new Date(reservation.start_date) > end) return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [
        reservation.vehicle_label,
        reservation.owner_name,
        reservation.customer_name,
        reservation.customer_email,
        reservation.pickup_location,
        reservation.return_location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [reservations, query, statusFilter, periodStart, periodEnd]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Véhicule, propriétaire, client…"
              className="de-input w-full pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="de-input w-full"
          >
            {RESERVATION_STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:grid-cols-2">
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="de-input w-full"
              aria-label="Début période"
            />
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="de-input w-full"
              aria-label="Fin période"
            />
          </div>
        </div>

        <Link
          href="/admin/reservations/nouveau"
          className="de-btn de-btn-primary inline-flex w-full items-center justify-center gap-2 xl:w-auto"
        >
          <Plus size={16} strokeWidth={1.75} />
          Créer une réservation
        </Link>
      </div>

      <p className="text-xs de-muted">
        {filtered.length} réservation{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="de-empty">Aucune réservation trouvée</p>
      ) : (
        <div className="de-list">
          {filtered.map((reservation) => (
            <Link
              key={reservation.id}
              href={`/admin/reservations/${reservation.id}`}
              className="de-list-item block transition hover:border-[var(--blue-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium capitalize">{reservation.vehicle_label}</p>
                  <p className="mt-0.5 text-sm de-muted">{reservation.owner_name}</p>
                </div>
                <span
                  className={`de-badge ${getReservationStatusBadgeClass(reservation)}`}
                >
                  {getReservationStatusLabel(reservation)}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="de-label text-[0.6875rem]">Client</p>
                  <p className="mt-0.5 text-sm">{reservation.customer_name ?? "—"}</p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Dates</p>
                  <p className="mt-0.5 text-sm">
                    {formatDate(reservation.start_date)} →{" "}
                    {formatDate(reservation.end_date)}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Lieux</p>
                  <p className="mt-0.5 text-sm de-muted">
                    {reservation.pickup_location ?? "—"} →{" "}
                    {reservation.return_location ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Montants</p>
                  <p className="mt-0.5 text-sm">
                    {formatEuro(reservation.total_price)}
                  </p>
                  <p className="text-xs de-muted">
                    Prop. {formatEuro(reservation.owner_amount)} · DE{" "}
                    {formatEuro(reservation.company_amount)}
                  </p>
                  {reservation.status === "finished" &&
                    reservation.distance_km != null && (
                      <p className="text-xs de-muted">
                        {formatDistanceKm(reservation.distance_km)} parcourus
                      </p>
                    )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
