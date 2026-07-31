import type { OwnerReservation } from "@/src/lib/admin/owners-types";
import { formatDistanceKm } from "@/src/lib/admin/reservations-types";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "de-badge--pending",
    confirmed: "de-badge--confirmed",
    finished: "de-badge--finished",
    cancelled: "de-badge--cancelled",
  };

  const labels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    finished: "Terminée",
    cancelled: "Annulée",
  };

  return {
    className: map[status] ?? "de-badge--finished",
    label: labels[status] ?? status,
  };
}

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

export default function OwnerReservationsList({
  reservations,
}: {
  reservations: OwnerReservation[];
}) {
  if (reservations.length === 0) {
    return <p className="de-empty">Aucune réservation</p>;
  }

  return (
    <div className="de-list">
      {reservations.map((reservation) => {
        const badge = statusBadge(reservation.status);

        return (
          <div key={reservation.id} className="de-list-item space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{reservation.vehicleLabel}</p>
              <span className={`de-badge ${badge.className}`}>{badge.label}</span>
            </div>

            <p className="text-sm de-muted">
              {new Date(reservation.start_date).toLocaleDateString("fr-FR")}
              {" → "}
              {new Date(reservation.end_date).toLocaleDateString("fr-FR")}
            </p>

            {reservation.customer_name && (
              <p className="text-sm de-muted">{reservation.customer_name}</p>
            )}

            <p className="text-sm font-medium text-[var(--blue-soft)]">
              {formatEuro(reservation.total_price)}
            </p>
            {reservation.status === "finished" &&
              reservation.distance_km != null && (
                <p className="text-xs de-muted">
                  {formatDistanceKm(reservation.distance_km)} parcourus
                </p>
              )}
          </div>
        );
      })}
    </div>
  );
}
