"use client";

import Link from "next/link";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import VehicleStatusBadge from "@/src/components/vehicle-status-badge";

type Vehicle = {
  vehicle_id?: string;
  brand: string;
  model: string;
  year?: number | null;
  plate?: string | null;
  mileage?: number | null;
  initial_mileage?: number | null;
  status?: string;
  image_url?: string | null;
  total_revenue?: number | null;
};

function contractMileage(vehicle: Vehicle) {
  return vehicle.initial_mileage ?? vehicle.mileage ?? null;
}

export default function VehicleCard({
  vehicle,
  href,
}: {
  vehicle: Vehicle;
  href?: string;
}) {
  const imageUrl = resolveVehicleImageUrl(vehicle.image_url);
  const linkHref =
    href ?? `/espace-proprietaire/vehicule/${vehicle.vehicle_id ?? ""}`;
  const km = contractMileage(vehicle);

  return (
    <Link
      href={linkHref}
      className="de-card group block overflow-hidden transition hover:border-[var(--blue-soft)]"
    >
      <div className="relative h-48 w-full sm:h-44">
        {imageUrl ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-xs de-muted">Aucune photo</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/90 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="de-display text-xl tracking-tight">
            {vehicle.brand} {vehicle.model}
          </h3>
          <div className="mt-2">
            <VehicleStatusBadge status={vehicle.status} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--blue-border)] px-4 py-4">
        <p className="text-sm de-muted">
          {vehicle.year ?? "—"}
          {vehicle.plate ? ` · ${vehicle.plate}` : ""}
          {km != null ? ` · ${km.toLocaleString("fr-FR")} km` : ""}
        </p>

        <div className="text-right">
          <p className="text-xs de-muted">Revenus</p>
          <p className="text-sm font-medium">
            {(vehicle.total_revenue ?? 0).toLocaleString("fr-FR")} €
          </p>
        </div>
      </div>
    </Link>
  );
}
