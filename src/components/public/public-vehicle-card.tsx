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

function SpecLine({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <span className="de-vehicle-spec">
      <span className="de-vehicle-spec-label">{label}</span>
      {value}
    </span>
  );
}

export default function PublicVehicleCard({ vehicle }: { vehicle: PublicVehicle }) {
  const href = `${PUBLIC_ROUTES.vehicles}/${vehicle.slug}`;
  const fromPrice = formatPrice(getLowestRentalPrice(vehicle.pricing));

  return (
    <Link href={href} className="de-public-vehicle-card group">
      <div className="de-public-vehicle-card-image">
        <VehicleImage
          src={vehicle.image_url}
          alt={buildVehicleImageAlt({
            brand: vehicle.brand,
            model: vehicle.model,
            version: vehicle.version,
            year: vehicle.year,
            location: vehicle.location,
          })}
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <div className="de-public-vehicle-card-gradient" />
        <span
          className={`de-badge de-public-vehicle-card-badge ${getPublicVehicleStatusBadgeClass(vehicle.status)}`}
        >
          {getPublicVehicleStatusLabel(vehicle.status)}
        </span>
      </div>

      <div className="de-public-vehicle-card-body">
        <div className="de-public-vehicle-card-top">
          <div>
            <p className="de-public-vehicle-brand">{vehicle.brand}</p>
            <h3 className="de-display de-public-vehicle-model">
              {vehicle.model}
              {vehicle.version ? ` ${vehicle.version}` : ""}
            </h3>
          </div>
          <div className="de-public-vehicle-price">
            <p className="de-public-vehicle-price-label">À partir de</p>
            <p className="de-public-vehicle-price-value">
              {fromPrice ?? "Sur demande"}
            </p>
          </div>
        </div>

        <div className="de-public-vehicle-specs">
          <SpecLine label="Année" value={vehicle.year ? String(vehicle.year) : null} />
          <SpecLine label="Carburant" value={getFuelLabel(vehicle.fuel)} />
          <SpecLine label="Boîte" value={getTransmissionLabel(vehicle.transmission)} />
          <SpecLine label="Puissance" value={formatPower(vehicle.power)} />
        </div>
      </div>
    </Link>
  );
}
