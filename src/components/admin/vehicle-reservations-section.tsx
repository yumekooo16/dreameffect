import type { ReservationRow } from "@/src/lib/admin/dashboard-data";
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

function ReservationGroup({
  title,
  reservations,
}: {
  title: string;
  reservations: ReservationRow[];
}) {
  if (reservations.length === 0) {
    return (
      <div>
        <p className="de-label mb-2">{title}</p>
        <p className="de-empty text-sm">Aucune réservation</p>
      </div>
    );
  }

  return (
    <div>
      <p className="de-label mb-2">{title}</p>
      <div className="de-list">
        {reservations.map((reservation) => {
          const badge = statusBadge(reservation.status);

          return (
            <div key={reservation.id} className="de-list-item space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {new Date(reservation.start_date).toLocaleDateString("fr-FR")}
                  {" → "}
                  {new Date(reservation.end_date).toLocaleDateString("fr-FR")}
                </p>
                <span className={`de-badge ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              {reservation.customer_name && (
                <p className="text-sm de-muted">{reservation.customer_name}</p>
              )}
              <p className="text-sm font-medium text-[var(--blue-soft)]">
                {Number(reservation.total_price ?? 0).toLocaleString("fr-FR")} €
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
    </div>
  );
}

export default function VehicleReservationsSection({
  current,
  upcoming,
  past,
}: {
  current: ReservationRow[];
  upcoming: ReservationRow[];
  past: ReservationRow[];
}) {
  return (
    <div className="space-y-6">
      <ReservationGroup title="En cours" reservations={current} />
      <ReservationGroup title="À venir" reservations={upcoming} />
      <ReservationGroup title="Historique" reservations={past} />
    </div>
  );
}
