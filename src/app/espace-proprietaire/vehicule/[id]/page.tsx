import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { getAuthUser } from "@/src/lib/auth";
import { notFound } from "next/navigation";
import VehicleTabs from "@/src/components/owner/vehicle-tabs";
import VehicleImage from "@/src/components/owner/vehicle-image";
import VehicleStatusBadge from "@/src/components/vehicle-status-badge";
import Reservations from "@/src/components/reservations";
import Documents from "@/src/components/documents";
import Maintenance from "@/src/components/maintenance";
import {
  fetchOwnerPortalVehicle,
  ownerPortalContractMileage,
} from "@/src/lib/owner/vehicles-data";
import { getVehicleStatusLabel } from "@/src/lib/vehicles/status";

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthUser();

  if (!user) {
    notFound();
  }

  const vehicle = await fetchOwnerPortalVehicle(user.id, id);

  if (!vehicle) {
    notFound();
  }

  const supabase = await createClient();

  const [reservationsRes, documentsRes, maintenanceRes] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "id, start_date, end_date, customer_name, status, owner_amount, total_price, distance_km"
      )
      .eq("vehicle_id", id)
      .order("start_date", { ascending: false })
      .limit(50),
    supabase
      .from("documents")
      .select("id, type, name, file_url, expiration_date, is_valid")
      .eq("vehicle_id", id),
    supabase
      .from("maintenance")
      .select(
        "id, title, type, description, mileage, maintenance_date, next_due_date"
      )
      .eq("vehicle_id", id)
      .order("maintenance_date", { ascending: false })
      .limit(20),
  ]);

  const allReservations = reservationsRes.data ?? [];
  const maintenance = maintenanceRes.data ?? [];
  const contractKm = ownerPortalContractMileage(vehicle);
  const finishedReservations = allReservations.filter(
    (r) => r.status === "finished"
  );

  const now = new Date();
  const monthlyRevenue = finishedReservations
    .filter((r) => {
      const end = new Date(r.end_date);
      return (
        end.getMonth() === now.getMonth() &&
        end.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, r) => sum + Number(r.owner_amount ?? r.total_price ?? 0), 0);

  return (
    <div className="space-y-8">
      <Link
        href="/espace-proprietaire"
        className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
      >
        ← Retour au tableau de bord
      </Link>

      <div className="de-card overflow-hidden">
        <div className="relative h-52 sm:h-64">
          <VehicleImage
            src={vehicle.image_url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="de-card-padded">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-sm de-muted">
                {vehicle.year ?? "—"}
                {vehicle.plate ? ` · ${vehicle.plate}` : ""}
                {contractKm != null
                  ? ` · ${contractKm.toLocaleString("fr-FR")} km`
                  : ""}
              </p>
            </div>
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="de-card-inner">
              <p className="de-label">Statut</p>
              <p className="mt-1 font-medium">
                {getVehicleStatusLabel(vehicle.status)}
              </p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Immatriculation</p>
              <p className="mt-1 font-medium uppercase">
                {vehicle.plate?.trim() || "—"}
              </p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Km début contrat</p>
              <p className="mt-1 font-medium">
                {contractKm != null
                  ? `${contractKm.toLocaleString("fr-FR")} km`
                  : "—"}
              </p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Revenus générés</p>
              <p className="mt-1 font-medium text-[var(--blue-soft)]">
                {Number(vehicle.total_revenue ?? 0).toLocaleString("fr-FR")} €
              </p>
            </div>
          </div>
        </div>
      </div>

      <VehicleTabs
        overview={
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="de-card-inner">
              <p className="de-label">Marque & modèle</p>
              <p className="mt-1 font-medium">
                {vehicle.brand} {vehicle.model}
              </p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Année</p>
              <p className="mt-1 font-medium">{vehicle.year ?? "—"}</p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Locations terminées</p>
              <p className="mt-1 font-medium">{finishedReservations.length}</p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Revenus totaux</p>
              <p className="mt-1 font-medium text-[var(--blue-soft)]">
                {Number(vehicle.total_revenue ?? 0).toLocaleString("fr-FR")} €
              </p>
            </div>
          </div>
        }
        reservations={<Reservations reservations={allReservations} />}
        documents={<Documents documents={documentsRes.data ?? []} />}
        maintenance={<Maintenance maintenances={maintenance} />}
        calendarReservations={allReservations}
        calendarMaintenances={maintenance}
        revenueProps={{
          totalRevenue: Number(vehicle.total_revenue ?? 0),
          monthlyRevenue,
          totalRentals: finishedReservations.length,
          reservations: allReservations,
        }}
      />
    </div>
  );
}
