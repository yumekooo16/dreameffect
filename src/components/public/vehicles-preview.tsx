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
    <section className="de-section de-section-alt" aria-labelledby="home-fleet-title">
      <div className="de-public-container">
        <header className="de-exhibit-head">
          <p className="de-exhibit-head-num" aria-hidden>
            03
          </p>
          <div>
            <p className="de-mono-label">Collection</p>
            <h2 id="home-fleet-title" className="de-display de-exhibit-head-title">
              À disposition
            </h2>
          </div>
          <p className="de-exhibit-head-lede">
            {preview.length} lot{preview.length > 1 ? "s" : ""} — tarifs à la
            journée, réservation par WhatsApp.
          </p>
        </header>

        <div className="de-lot-strip" role="list">
          {preview.map((vehicle, index) => (
            <PublicVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              index={index + 1}
            />
          ))}
        </div>

        <Link href={PUBLIC_ROUTES.vehicles} className="de-text-cta" style={{ marginTop: "2rem" }}>
          Voir tout le catalogue
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
