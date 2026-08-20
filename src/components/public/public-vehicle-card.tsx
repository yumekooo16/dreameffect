import Link from "next/link";
import VehicleImage from "@/src/components/owner/vehicle-image";
import {
  getFuelLabel,
  getTransmissionLabel,
  formatPower,
} from "@/src/lib/vehicles/catalog-fields";
import {
  getLowestRentalPrice,
  formatPrice,
} from "@/src/lib/vehicles/pricing";
import {
  getPublicVehicleStatusBadgeClass,
  getPublicVehicleStatusLabel,
} from "@/src/lib/public/vehicle-status";
import { buildVehicleImageAlt } from "@/src/lib/public/local-seo";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

function SpecCell({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div className="de-fleet-spec">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function PublicVehicleCard({ vehicle }: { vehicle: PublicVehicle }) {
  const href = `${PUBLIC_ROUTES.vehicles}/${vehicle.slug}`;
  const fromPrice = formatPrice(getLowestRentalPrice(vehicle.pricing));

  return (
    <Link href={href} className="de-fleet-card">
      <div className="de-fleet-card-media">
        <VehicleImage
          src={vehicle.image_url}
          alt={buildVehicleImageAlt({
            brand: vehicle.brand,
            model: vehicle.model,
            version: vehicle.version,
            year: vehicle.year,
            location: vehicle.location,
          })}
          className="object-cover de-fleet-card-image"
        />
        <span
          className={`de-badge de-fleet-card-badge ${getPublicVehicleStatusBadgeClass(vehicle.status)}`}
        >
          {getPublicVehicleStatusLabel(vehicle.status)}
        </span>
        <div className="de-fleet-card-price">
          <span>À partir de</span>
          <strong className="de-display">{fromPrice ?? "Sur demande"}</strong>
        </div>
      </div>

      <div className="de-fleet-card-body">
        <p className="de-fleet-card-brand">{vehicle.brand}</p>
        <h3 className="de-display de-fleet-card-model">
          {vehicle.model}
          {vehicle.version ? ` ${vehicle.version}` : ""}
        </h3>
        <dl className="de-fleet-specs">
          <SpecCell label="Année" value={vehicle.year ? String(vehicle.year) : null} />
          <SpecCell label="Carburant" value={getFuelLabel(vehicle.fuel)} />
          <SpecCell label="Boîte" value={getTransmissionLabel(vehicle.transmission)} />
          <SpecCell label="Puissance" value={formatPower(vehicle.power)} />
        </dl>
      </div>
    </Link>
  );
}
