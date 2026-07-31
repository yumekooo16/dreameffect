import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/lib/admin/auth";
import {
  fetchMaintenanceDetail,
  fetchVehiclesForMaintenanceForm,
} from "@/src/lib/admin/maintenance-data";
import {
  getMaintenanceDueBadgeClass,
  getMaintenanceDueLabel,
  getMaintenanceTypeBadgeClass,
  getMaintenanceTypeLabel,
} from "@/src/lib/maintenance/type";
import Section from "@/src/components/owner/section";
import VehicleImage from "@/src/components/owner/vehicle-image";
import MaintenanceActionsPanel from "@/src/components/admin/maintenance-actions";
import type { MaintenanceType } from "@/src/lib/maintenance/type";

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [maintenance, vehicles] = await Promise.all([
    fetchMaintenanceDetail(id),
    fetchVehiclesForMaintenanceForm(),
  ]);

  if (!maintenance) {
    notFound();
  }

  const ownerName =
    [maintenance.owner.first_name, maintenance.owner.last_name]
      .filter(Boolean)
      .join(" ") || "Propriétaire";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/maintenance"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour à la maintenance
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
              {maintenance.title}
            </h1>
            <p className="mt-1 text-sm de-muted capitalize">
              {maintenance.vehicle_label} — {ownerName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`de-badge ${getMaintenanceTypeBadgeClass(maintenance.type)}`}
            >
              {getMaintenanceTypeLabel(maintenance.type)}
            </span>
            {maintenance.next_due_date && (
              <span
                className={`de-badge ${getMaintenanceDueBadgeClass(maintenance.next_due_date)}`}
              >
                {getMaintenanceDueLabel(maintenance.next_due_date)}
              </span>
            )}
          </div>
        </div>
      </div>

      <Section title="Véhicule">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="relative h-40 overflow-hidden rounded-[var(--radius)] border border-[var(--blue-border)] bg-muted lg:h-full lg:min-h-[160px]">
            <VehicleImage
              src={maintenance.vehicle.image_url}
              alt={maintenance.vehicle_label}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="de-card-inner">
              <p className="de-label">Marque / Modèle</p>
              <Link
                href={`/admin/vehicules/${maintenance.vehicle.id}`}
                className="mt-1 inline-block font-medium capitalize text-[var(--blue-soft)] hover:underline"
              >
                {maintenance.vehicle.brand} {maintenance.vehicle.model}
              </Link>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Propriétaire</p>
              <Link
                href={`/admin/proprietaires/${maintenance.owner.id}`}
                className="mt-1 inline-block font-medium text-[var(--blue-soft)] hover:underline"
              >
                {ownerName}
              </Link>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Kilométrage actuel</p>
              <p className="mt-1 font-medium">
                {maintenance.vehicle.mileage.toLocaleString("fr-FR")} km
              </p>
            </div>
            {maintenance.owner.phone && (
              <div className="de-card-inner">
                <p className="de-label">Téléphone</p>
                <p className="mt-1 font-medium">{maintenance.owner.phone}</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section title="Intervention">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="de-card-inner sm:col-span-2 lg:col-span-3">
            <p className="de-label">Description</p>
            <p className="mt-1 text-sm">
              {maintenance.description ?? "—"}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Date</p>
            <p className="mt-1 font-medium">
              {formatDate(maintenance.maintenance_date)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Kilométrage intervention</p>
            <p className="mt-1 font-medium">
              {maintenance.mileage != null
                ? `${maintenance.mileage.toLocaleString("fr-FR")} km`
                : "—"}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Prochaine échéance</p>
            <p className="mt-1 font-medium">
              {formatDate(maintenance.next_due_date)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Prestataire</p>
            <p className="mt-1 font-medium">{maintenance.provider ?? "—"}</p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Coût</p>
            <p className="de-stat-value mt-1 text-xl text-[var(--blue-soft)]">
              {formatEuro(maintenance.cost)}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Actions administrateur">
        <MaintenanceActionsPanel
          maintenanceId={maintenance.id}
          vehicles={vehicles}
          ownerPhone={maintenance.owner.phone}
          initial={{
            vehicle_id: maintenance.vehicle_id,
            type: maintenance.type as MaintenanceType,
            title: maintenance.title,
            description: maintenance.description ?? "",
            mileage: maintenance.mileage ?? maintenance.vehicle.mileage,
            maintenance_date: maintenance.maintenance_date ?? "",
            next_due_date: maintenance.next_due_date ?? "",
            cost: Number(maintenance.cost ?? 0),
            provider: maintenance.provider ?? "",
          }}
        />
      </Section>
    </div>
  );
}
