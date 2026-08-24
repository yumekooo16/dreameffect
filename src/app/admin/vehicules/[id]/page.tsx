import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/lib/admin/auth";
import {
  fetchOwnersForSelect,
  fetchVehicleDetail,
} from "@/src/lib/admin/vehicles-data";
import { splitReservations } from "@/src/lib/admin/vehicles-types";
import { syncVehicleStatusFromReservations } from "@/src/lib/vehicles/sync-status";
import {
  getVehicleStatusBadgeClass,
  getVehicleStatusLabel,
} from "@/src/lib/vehicles/status";
import Section from "@/src/components/owner/section";
import VehicleImage from "@/src/components/owner/vehicle-image";
import LazyWhenVisible from "@/src/components/owner/lazy-when-visible";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import VehiclePhotosManager from "@/src/components/admin/vehicle-photos-manager";
import VehicleHeroImageManager from "@/src/components/admin/vehicle-hero-image-manager";
import VehicleReservationsSection from "@/src/components/admin/vehicle-reservations-section";
import VehicleRevenueSection from "@/src/components/admin/vehicle-revenue-section";
import VehicleMaintenanceSection from "@/src/components/admin/vehicle-maintenance-section";
import VehicleDocumentsSection from "@/src/components/admin/vehicle-documents-section";
import VehicleActionsPanel from "@/src/components/admin/vehicle-actions";
import type { VehicleFormData } from "@/src/lib/admin/vehicles-actions";

const Calendar = dynamic(
  () => import("@/src/components/calendar"),
  { loading: () => <ChartSkeleton /> }
);

function ownerName(
  firstName?: string | null,
  lastName?: string | null
) {
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

export default async function AdminVehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  await syncVehicleStatusFromReservations(id);

  const [data, owners] = await Promise.all([
    fetchVehicleDetail(id),
    fetchOwnersForSelect(),
  ]);

  if (!data) {
    notFound();
  }

  const { vehicle, owner, dashboard, images, reservations, maintenances, documents, revenue } =
    data;

  const { past, current, upcoming } = splitReservations(reservations);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/vehicules"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour à la flotte
        </Link>
      </div>

      <div className="de-card overflow-hidden">
        <div className="relative h-52 sm:h-72">
          <VehicleImage
            src={vehicle.image_url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="de-card-padded">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="de-display text-2xl sm:text-3xl tracking-tight capitalize">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="mt-1 text-sm de-muted">
                {vehicle.year ?? "—"} ·{" "}
                {vehicle.mileage.toLocaleString("fr-FR")} km
                {vehicle.plate ? ` · ${vehicle.plate}` : ""}
              </p>
            </div>
            <span
              className={`de-badge ${getVehicleStatusBadgeClass(vehicle.status)}`}
            >
              {getVehicleStatusLabel(vehicle.status)}
            </span>
          </div>
        </div>
      </div>

      <Section title="Informations générales">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="de-card-inner">
            <p className="de-label">Marque & modèle</p>
            <p className="mt-1 font-medium capitalize">
              {vehicle.brand} {vehicle.model}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Immatriculation</p>
            <p className="mt-1 font-medium uppercase">
              {vehicle.plate?.trim() || "—"}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Année</p>
            <p className="mt-1 font-medium">{vehicle.year ?? "—"}</p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Kilométrage</p>
            <p className="mt-1 font-medium">
              {vehicle.mileage.toLocaleString("fr-FR")} km
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Propriétaire</p>
            <Link
              href={`/admin/proprietaires/${owner.id}`}
              className="mt-1 inline-block font-medium text-[var(--blue-soft)] transition hover:underline"
            >
              {ownerName(owner.first_name, owner.last_name)}
            </Link>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Statut</p>
            <p className="mt-1 font-medium">
              {getVehicleStatusLabel(vehicle.status)}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Image site internet">
        <VehiclePhotosManager
          vehicleId={vehicle.id}
          images={images}
          publicImageUrl={vehicle.public_image_url}
          primaryImageUrl={vehicle.image_url}
        />
      </Section>

      <Section title="Image espace propriétaire">
        <VehicleHeroImageManager
          vehicleId={vehicle.id}
          heroImageUrl={vehicle.hero_image_url}
        />
      </Section>

      <Section title="Disponibilités">
        <LazyWhenVisible>
          <Calendar
            reservations={reservations}
            maintenances={maintenances}
          />
        </LazyWhenVisible>
      </Section>

      <Section title="Réservations">
        <VehicleReservationsSection
          current={current}
          upcoming={upcoming}
          past={past}
        />
      </Section>

      <Section title="Revenus">
        <VehicleRevenueSection
          revenue={revenue}
          rentalCount={dashboard.total_rentals}
        />
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Maintenance">
          <VehicleMaintenanceSection
            maintenances={maintenances}
            vehicleId={vehicle.id}
          />
        </Section>

        <Section title="Documents">
          <VehicleDocumentsSection
            documents={documents}
            vehicleId={vehicle.id}
          />
        </Section>
      </div>

      <Section title="Actions administrateur">
        <VehicleActionsPanel
          vehicleId={vehicle.id}
          owners={owners}
          isUnavailable={vehicle.status === "unavailable"}
          initial={{
            owner_id: vehicle.owner_id,
            brand: vehicle.brand,
            model: vehicle.model,
            version: vehicle.version ?? "",
            year: vehicle.year,
            plate: vehicle.plate ?? "",
            vin: vehicle.vin ?? "",
            color: vehicle.color ?? "",
            mileage: vehicle.mileage,
            status: vehicle.status as "available" | "rented" | "maintenance" | "unavailable",
            pricing: {
              price_24h_weekday: vehicle.price_24h_weekday ?? null,
              price_24h_weekend: vehicle.price_24h_weekend ?? null,
              price_48h_weekend: vehicle.price_48h_weekend ?? null,
              price_72h_weekend: vehicle.price_72h_weekend ?? null,
              price_7_days: vehicle.price_7_days ?? null,
              deposit: vehicle.deposit ?? null,
            },
            proPricing: {
              pro_price_24h_weekday: vehicle.pro_price_24h_weekday ?? null,
              pro_price_24h_weekend: vehicle.pro_price_24h_weekend ?? null,
              pro_price_48h_weekend: vehicle.pro_price_48h_weekend ?? null,
              pro_price_72h_weekend: vehicle.pro_price_72h_weekend ?? null,
              pro_price_7_days: vehicle.pro_price_7_days ?? null,
              pro_included_km: vehicle.pro_included_km ?? 200,
              pro_extra_km_rate: vehicle.pro_extra_km_rate ?? 1,
            },
            fuel: (vehicle.fuel as VehicleFormData["fuel"]) ?? "",
            transmission: (vehicle.transmission as VehicleFormData["transmission"]) ?? "",
            power: vehicle.power ?? null,
            location: vehicle.location ?? "",
            description: vehicle.description ?? "",
            is_published: vehicle.is_published ?? true,
          }}
        />
      </Section>
    </div>
  );
}
