import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicVehicleCard from "@/src/components/public/public-vehicle-card";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { pickPreviewVehicles } from "@/src/lib/public/group-vehicles-by-brand";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type VehiclesPreviewProps = {
  vehicles?: PublicVehicle[];
  /** Nombre max affiché sur l'accueil */
  limit?: number;
};

export default function VehiclesPreview({
  vehicles = [],
  limit = 6,
}: VehiclesPreviewProps) {
  const preview = pickPreviewVehicles(vehicles, limit);

  if (preview.length === 0) {
    return null;
  }

  return (
    <section className="de-section de-section-alt">
      <div className="de-public-container">
        <div className="de-section-header de-section-header-row">
          <div>
            <p className="de-section-eyebrow">Flotte</p>
            <h2 className="de-display de-section-title">Nos véhicules</h2>
            <p className="de-section-description">
              {preview.length} modèle{preview.length > 1 ? "s" : ""} disponible
              {preview.length > 1 ? "s" : ""} — tarifs à la journée, réservation
              par WhatsApp ou formulaire.
            </p>
          </div>
          <Link
            href={PUBLIC_ROUTES.vehicles}
            className="de-btn de-btn-ghost shrink-0 self-start"
          >
            Tout voir
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="de-vehicles-grid">
          {preview.map((vehicle) => (
            <PublicVehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}
