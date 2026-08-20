import Link from "next/link";
import VehicleGallery from "@/src/components/public/vehicle-gallery";
import VehiclePricingTable from "@/src/components/public/vehicle-pricing-table";
import VehicleBookingPanel from "@/src/components/public/vehicle-booking-panel";
import {
  formatPower,
  getFuelLabel,
  getTransmissionLabel,
} from "@/src/lib/vehicles/catalog-fields";
import {
  getPublicVehicleStatusBadgeClass,
  getPublicVehicleStatusLabel,
} from "@/src/lib/public/vehicle-status";
import { getLowestRentalPrice, formatPrice } from "@/src/lib/vehicles/pricing";
import { buildVehicleImageAlt } from "@/src/lib/public/local-seo";
import { getVehicleDisplayName } from "@/src/lib/public/vehicles-data";
import type { PublicVehicleDetail } from "@/src/lib/public/vehicles-types";
import type { VehicleAvailability } from "@/src/lib/public/availability-data";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

function SpecItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="de-fleet-spec">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function VehicleDetailContent({
  vehicle,
  availability,
}: {
  vehicle: PublicVehicleDetail;
  availability: VehicleAvailability;
}) {
  const displayName = getVehicleDisplayName(vehicle);
  const imageAlt = buildVehicleImageAlt({
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    year: vehicle.year,
    location: vehicle.location,
  });
  const fromPrice = formatPrice(getLowestRentalPrice(vehicle.pricing));

  return (
    <section className="de-section de-section-compact">
      <div className="de-public-container">
        <Link href={PUBLIC_ROUTES.vehicles} className="de-back-link">
          ← Retour au catalogue
        </Link>

        <div className="de-vehicle-detail-layout">
          <VehicleGallery images={vehicle.images} alt={imageAlt} />

          <div className="de-vehicle-detail-panel">
            <div className="de-vehicle-detail-header">
              <div>
                <p className="de-public-vehicle-brand">{vehicle.brand}</p>
                <h1 className="de-display de-vehicle-detail-title">
                  {vehicle.model}
                  {vehicle.version ? ` ${vehicle.version}` : ""}
                </h1>
                {vehicle.year && (
                  <p className="mt-1 text-sm de-muted">{vehicle.year}</p>
                )}
              </div>
              <span
                className={`de-badge ${getPublicVehicleStatusBadgeClass(vehicle.status)}`}
              >
                {getPublicVehicleStatusLabel(vehicle.status)}
              </span>
            </div>

            {fromPrice && (
              <div className="de-vehicle-detail-price-block">
                <p className="de-public-vehicle-price-label">À partir de</p>
                <p className="de-display de-vehicle-detail-price">{fromPrice}</p>
              </div>
            )}

            <VehiclePricingTable pricing={vehicle.pricing} />

            <dl className="de-fleet-specs de-vehicle-detail-specs">
              <SpecItem label="Carburant" value={getFuelLabel(vehicle.fuel)} />
              <SpecItem
                label="Boîte de vitesses"
                value={getTransmissionLabel(vehicle.transmission)}
              />
              <SpecItem label="Puissance" value={formatPower(vehicle.power)} />
              <SpecItem label="Couleur" value={vehicle.color ?? undefined} />
              <SpecItem
                label="Année"
                value={vehicle.year ? String(vehicle.year) : undefined}
              />
            </dl>

            {vehicle.description?.trim() && (
              <div className="de-vehicle-detail-description">
                <h2 className="de-display text-lg tracking-tight">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed de-muted">
                  {vehicle.description.trim()}
                </p>
              </div>
            )}
          </div>
        </div>

        <VehicleBookingPanel vehicle={vehicle} availability={availability} />
      </div>
    </section>
  );
}
