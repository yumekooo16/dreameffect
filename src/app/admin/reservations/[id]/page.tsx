import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchReservationDetail,
  fetchVehiclesForReservationForm,
} from "@/src/lib/admin/reservations-data";
import {
  getReservationStatusBadgeClass,
  getReservationStatusLabel,
} from "@/src/lib/reservations/status";
import { formatDistanceKm } from "@/src/lib/admin/reservations-types";
import Section from "@/src/components/owner/section";
import VehicleImage from "@/src/components/owner/vehicle-image";
import ReservationActionsPanel from "@/src/components/admin/reservation-actions";
import ReservationDeleteButton from "@/src/components/admin/reservation-delete-button";

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [reservation, formData] = await Promise.all([
    fetchReservationDetail(id),
    fetchVehiclesForReservationForm(),
  ]);

  if (!reservation) {
    notFound();
  }

  const { vehicles, revenueConfigs } = formData;

  const canConfirm = reservation.status === "pending";
  const canFinish =
    reservation.status === "confirmed" || reservation.status === "pending";
  const canCancel =
    reservation.status !== "finished" && reservation.status !== "cancelled";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/reservations"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour aux réservations
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
              Réservation
            </h1>
            <p className="mt-1 text-sm de-muted capitalize">
              {reservation.vehicle_label} — {reservation.customer_name}
            </p>
          </div>
          <span
            className={`de-badge ${getReservationStatusBadgeClass(reservation)}`}
          >
            {getReservationStatusLabel(reservation)}
          </span>
        </div>
      </div>

      <Section title="Client">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="de-card-inner">
            <p className="de-label">Nom</p>
            <p className="mt-1 font-medium">{reservation.customer_name ?? "—"}</p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Email</p>
            <p className="mt-1 font-medium">
              {reservation.customer_email ?? "—"}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Historique client</p>
            <p className="mt-1 text-sm">
              {reservation.client_history.total_reservations} réservation
              {reservation.client_history.total_reservations !== 1 ? "s" : ""}
            </p>
            <p className="text-xs de-muted">
              {reservation.client_history.finished_reservations} terminée
              {reservation.client_history.finished_reservations !== 1 ? "s" : ""}{" "}
              · {formatEuro(reservation.client_history.total_spent)} dépensés
            </p>
          </div>
        </div>
      </Section>

      <Section title="Véhicule">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="relative h-40 overflow-hidden rounded-[var(--radius)] border border-[var(--blue-border)] bg-muted lg:h-full lg:min-h-[160px]">
            <VehicleImage
              src={reservation.vehicle.image_url}
              alt={reservation.vehicle_label}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="de-card-inner">
              <p className="de-label">Véhicule</p>
              <Link
                href={`/admin/vehicules/${reservation.vehicle.id}`}
                className="mt-1 inline-block font-medium capitalize text-[var(--blue-soft)] hover:underline"
              >
                {reservation.vehicle.brand} {reservation.vehicle.model}
              </Link>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Propriétaire</p>
              <Link
                href={`/admin/proprietaires/${reservation.owner.id}`}
                className="mt-1 inline-block font-medium text-[var(--blue-soft)] hover:underline"
              >
                {[reservation.owner.first_name, reservation.owner.last_name]
                  .filter(Boolean)
                  .join(" ") || "Propriétaire"}
              </Link>
            </div>
            {reservation.owner.phone && (
              <div className="de-card-inner sm:col-span-2">
                <p className="de-label">Téléphone propriétaire</p>
                <p className="mt-1 font-medium">{reservation.owner.phone}</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="de-card-inner">
            <p className="de-label">Départ</p>
            <p className="mt-1 text-sm font-medium">
              {formatDateTime(reservation.start_date)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Retour</p>
            <p className="mt-1 text-sm font-medium">
              {formatDateTime(reservation.end_date)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Récupération</p>
            <p className="mt-1 font-medium">
              {reservation.pickup_location ?? "—"}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Retour</p>
            <p className="mt-1 font-medium">
              {reservation.return_location ?? "—"}
            </p>
          </div>
          {reservation.status === "finished" && (
            <div className="de-card-inner">
              <p className="de-label">Km parcourus</p>
              <p className="mt-1 font-medium">
                {formatDistanceKm(reservation.distance_km)}
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section title="Finance">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="de-card-inner">
            <p className="de-label">Montant total</p>
            <p className="de-stat-value mt-1 text-xl">
              {formatEuro(reservation.total_price)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Part propriétaire</p>
            <p className="de-stat-value mt-1 text-xl">
              {formatEuro(reservation.owner_amount)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Commission DreamEffect</p>
            <p className="de-stat-value mt-1 text-xl text-[var(--blue-soft)]">
              {formatEuro(reservation.company_amount)}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Actions administrateur">
        <div className="space-y-6">
          <ReservationActionsPanel
            reservationId={reservation.id}
            vehicles={vehicles}
            revenueConfigs={revenueConfigs}
            canConfirm={canConfirm}
            canFinish={canFinish}
            canCancel={canCancel}
            initial={{
              vehicle_id: reservation.vehicle_id,
              customer_name: reservation.customer_name ?? "",
              customer_email: reservation.customer_email ?? "",
              start_date: reservation.start_date,
              end_date: reservation.end_date,
              pickup_location: reservation.pickup_location ?? "",
              return_location: reservation.return_location ?? "",
              total_price: Number(reservation.total_price ?? 0),
              owner_amount: Number(reservation.owner_amount ?? 0),
              company_amount: Number(reservation.company_amount ?? 0),
              distance_km: reservation.distance_km ?? null,
              status: reservation.status as "pending" | "confirmed" | "finished" | "cancelled",
            }}
          />
          <ReservationDeleteButton
            reservationId={reservation.id}
            customerName={reservation.customer_name ?? "Client"}
          />
        </div>
      </Section>
    </div>
  );
}
