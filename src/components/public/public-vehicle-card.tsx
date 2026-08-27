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
  variant?: "list" | "runway" | "spotlight";
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
  const specs = [
    vehicle.year ? String(vehicle.year) : null,
    getFuelLabel(vehicle.fuel),
    getTransmissionLabel(vehicle.transmission),
    formatPower(vehicle.power),
  ].filter(Boolean);

  if (variant === "runway" || variant === "spotlight") {
    return (
      <Link href={href} className="de-keys-car">
        <div className="de-keys-car-media">
          <VehicleImage
            src={vehicle.image_url}
            alt={alt}
            frame={vehicle.imageFrame}
          />
          <span
            className={`de-badge de-lot-badge ${getPublicVehicleStatusBadgeClass(vehicle.status)}`}
            style={{ position: "absolute", top: "0.65rem", right: "0.65rem", zIndex: 2 }}
          >
            {getPublicVehicleStatusLabel(vehicle.status)}
          </span>
        </div>
        <div className="de-keys-car-body">
          <p className="de-keys-car-brand">{vehicle.brand}</p>
          <h3 className="de-keys-car-model">
            {vehicle.model}
            {vehicle.version ? ` ${vehicle.version}` : ""}
          </h3>
          {specs.length > 0 ? (
            <p className="de-keys-car-meta">{specs.join(" · ")}</p>
          ) : null}
          <p className="de-keys-car-price">
            <small>À partir de</small>
            {fromPrice ?? "Sur demande"}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="de-keys-lot">
      <div className="de-keys-lot-thumb">
        <VehicleImage
          src={vehicle.image_url}
          alt={alt}
          frame={vehicle.imageFrame}
        />
      </div>
      <div>
        <p className="de-keys-car-brand">
          {index != null ? `${String(index).padStart(2, "0")} · ` : ""}
          {vehicle.brand}
        </p>
        <h3 className="de-keys-car-model">
          {vehicle.model}
          {vehicle.version ? ` ${vehicle.version}` : ""}
        </h3>
        {specs.length > 0 ? (
          <p className="de-keys-car-meta">{specs.join(" · ")}</p>
        ) : null}
      </div>
      <div className="de-keys-car-price" style={{ textAlign: "right" }}>
        <small>À partir de</small>
        {fromPrice ?? "Sur demande"}
      </div>
    </Link>
  );
}
