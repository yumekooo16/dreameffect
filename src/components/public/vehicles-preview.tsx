import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicVehicleCard from "@/src/components/public/public-vehicle-card";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type VehiclesPreviewProps = {
  vehicles?: PublicVehicle[];
  /** Nombre max affiché sur l'accueil */
  limit?: number;
};

export default function VehiclesPreview({
  vehicles = [],
  limit = 3,
}: VehiclesPreviewProps) {
  const preview = vehicles.slice(0, limit);
  const hasVehicles = preview.length > 0;

  return (
    <section className="de-section de-section-alt">
      <div className="de-public-container">
        <div className="de-section-header de-section-header-row">
          <div>
            <h2 className="de-display de-section-title">Notre flotte</h2>
            <p className="de-section-description">
              Véhicules disponibles à la location, classés par marque dans le
              catalogue.
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

        {hasVehicles ? (
          <div className="de-vehicles-grid">
            {preview.map((vehicle) => (
              <PublicVehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="de-vehicles-empty">
            <p className="de-display text-lg tracking-tight">
              Le catalogue arrive bientôt
            </p>
            <p className="mt-2 max-w-md text-sm de-muted">
              Les véhicules seront publiés ici dès la connexion à la base de
              données. En attendant, contactez-nous pour connaître les
              disponibilités.
            </p>
            <Link
              href={PUBLIC_ROUTES.contact}
              className="de-btn de-btn-primary mt-6"
            >
              Nous contacter
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
