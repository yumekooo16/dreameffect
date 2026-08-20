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
  variant = "list",
}: {
  vehicle: PublicVehicle;
  index?: number;
  variant?: "list" | "spotlight";
}) {
  const isDemo = vehicle.id.startsWith("demo-");
  const href = isDemo
    ? PUBLIC_ROUTES.vehicles
    : `${PUBLIC_ROUTES.vehicles}/${vehicle.slug}`;
  const fromPrice = formatPrice(getLowestRentalPrice(vehicle.pricing));
  const alt = buildVehicleImageAlt({
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    year: vehicle.year,
    location: vehicle.location,
  });

  if (variant === "spotlight") {
    const excerpt =
      vehicle.description?.trim().slice(0, 120) ??
      `${vehicle.brand} ${vehicle.model} — disponible à ${vehicle.location ?? "Beauvais"}.`;

    return (
      <Link href={href} className="de-spotlight">
        <div className="de-spotlight-media">
          <VehicleImage src={vehicle.image_url} alt={alt} className="object-cover de-spotlight-image" />
          <span
            className={`de-badge de-spotlight-badge ${getPublicVehicleStatusBadgeClass(vehicle.status)}`}
          >
            {getPublicVehicleStatusLabel(vehicle.status)}
          </span>
        </div>
        <div className="de-spotlight-body">
          <p className="de-spotlight-brand">{vehicle.brand}</p>
          <h3 className="de-spotlight-model">
            {vehicle.model}
            {vehicle.version ? ` ${vehicle.version}` : ""}
          </h3>
          <p className="de-spotlight-excerpt">{excerpt}</p>
          <p className="de-spotlight-price">
            {fromPrice ? `À partir de ${fromPrice}` : "Tarifs sur demande"}
          </p>
          <span className="de-spotlight-cta">Voir les tarifs</span>
        </div>
      </Link>
    );
  }

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
        <VehicleImage src={vehicle.image_url} alt={alt} className="object-cover de-fleet-card-image" />
        <span className={`de-badge de-lot-badge ${getPublicVehicleStatusBadgeClass(vehicle.status)}`}>
          {getPublicVehicleStatusLabel(vehicle.status)}
        </span>
      </div>
      <div className="de-lot-info">
        <p className="de-lot-brand">{vehicle.brand}</p>
        <h3 className="de-lot-model">
          {vehicle.model}
          {vehicle.version ? ` ${vehicle.version}` : ""}
        </h3>
        {specs.length > 0 ? <p className="de-lot-specs">{specs.join(" · ")}</p> : null}
      </div>
      <div className="de-lot-price">
        <small>À partir de</small>
        {fromPrice ?? "Sur demande"}
      </div>
    </Link>
  );
}
