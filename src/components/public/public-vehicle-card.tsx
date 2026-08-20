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

export default function PublicVehicleCard({
  vehicle,
  index,
}: {
  vehicle: PublicVehicle;
  index?: number;
}) {
  const href = `${PUBLIC_ROUTES.vehicles}/${vehicle.slug}`;
  const fromPrice = formatPrice(getLowestRentalPrice(vehicle.pricing));
  const lotIndex = index != null ? String(index).padStart(2, "0") : "—";
  const specs = [
    vehicle.year ? String(vehicle.year) : null,
    getFuelLabel(vehicle.fuel),
    getTransmissionLabel(vehicle.transmission),
    formatPower(vehicle.power),
  ].filter(Boolean);

  return (
    <Link href={href} className="de-lot">
      <span className="de-lot-index" aria-hidden>
        {lotIndex}
      </span>

      <div className="de-lot-media">
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
          className={`de-badge de-lot-badge ${getPublicVehicleStatusBadgeClass(vehicle.status)}`}
        >
          {getPublicVehicleStatusLabel(vehicle.status)}
        </span>
      </div>

      <div className="de-lot-info">
        <p className="de-lot-brand">{vehicle.brand}</p>
        <h3 className="de-lot-model">
          {vehicle.model}
          {vehicle.version ? ` ${vehicle.version}` : ""}
        </h3>
        {specs.length > 0 ? (
          <p className="de-lot-specs">{specs.join(" · ")}</p>
        ) : null}
      </div>

      <div className="de-lot-price">
        <small>À partir de</small>
        {fromPrice ?? "Sur demande"}
      </div>
    </Link>
  );
}
