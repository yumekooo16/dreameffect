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
    <section className="de-keys-section de-keys-section--paper" aria-labelledby="home-fleet-title">
      <div className="de-public-container">
        <p className="de-keys-eyebrow">Flotte</p>
        <h2 id="home-fleet-title" className="de-keys-h2">
          À disposition
        </h2>
        <p className="de-keys-lede">
          {preview.length} modèle{preview.length > 1 ? "s" : ""} — tarifs à la journée,
          réservation par WhatsApp.
        </p>

        <div className="de-keys-runway-wrap">
          <div className="de-keys-runway">
            {preview.map((vehicle, index) => (
              <PublicVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index + 1}
                variant="runway"
              />
            ))}
          </div>
        </div>

        <Link href={PUBLIC_ROUTES.vehicles} className="de-keys-link">
          Voir tout le catalogue
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
