import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicVehicleCard from "@/src/components/public/public-vehicle-card";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type VehiclesPreviewProps = {
  vehicles?: PublicVehicle[];
  limit?: number;
};

export default function VehiclesPreview({
  vehicles = [],
  limit = 6,
}: VehiclesPreviewProps) {
  const preview = vehicles.slice(0, limit);

  if (preview.length === 0) {
    return null;
  }

  return (
    <section className="de-section de-motion-fleet" aria-labelledby="home-fleet-title">
      <div className="de-public-container de-motion-fleet-head">
        <div>
          <p className="de-motion-eyebrow">Sélection</p>
          <h2 id="home-fleet-title" className="de-motion-section-title">
            Nos véhicules phares
          </h2>
        </div>
        <Link href={PUBLIC_ROUTES.vehicles} className="de-motion-inline-cta">
          Voir tous les tarifs
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <div className="de-spotlight-grid">
        {preview.map((vehicle) => (
          <PublicVehicleCard key={vehicle.id} vehicle={vehicle} variant="spotlight" />
        ))}
      </div>
    </section>
  );
}
