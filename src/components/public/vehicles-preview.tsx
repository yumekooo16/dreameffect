import Link from "next/link";
import PublicVehicleCard from "@/src/components/public/public-vehicle-card";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { pickPreviewVehicles } from "@/src/lib/public/group-vehicles-by-brand";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type VehiclesPreviewProps = {
  vehicles?: PublicVehicle[];
  limit?: number;
};

export default function VehiclesPreview({
  vehicles = [],
  limit = 3,
}: VehiclesPreviewProps) {
  const preview = pickPreviewVehicles(vehicles, limit);

  if (preview.length === 0) {
    return null;
  }

  return (
    <section className="de-selection">
      <div className="de-public-container de-selection-header">
        <div>
          <p className="de-hero-eyebrow">Sélection</p>
          <h2 className="de-display de-selection-title">Nos véhicules</h2>
        </div>
        <Link href={PUBLIC_ROUTES.vehicles} className="de-text-link de-selection-all">
          Voir toute la flotte
        </Link>
      </div>

      <div className="de-selection-grid">
        {preview.map((vehicle) => (
          <PublicVehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}
