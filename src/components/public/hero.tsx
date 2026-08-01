import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HeroSection() {
  return (
    <section className="de-hero">
      <div className="de-hero-visual" aria-hidden>
        <div className="de-hero-visual-overlay" />
      </div>

      <div className="de-public-container de-hero-content">
        <p className="de-hero-eyebrow">
          {formatServiceAreaLabel()} · Location & gestion · Premium
        </p>

        <h1 className="de-display de-hero-title">
          Location et gestion
          <br />
          de véhicules haut de gamme.
        </h1>

        <p className="de-hero-subtitle">
          Vous souhaitez louer un véhicule ou faire rentabiliser le vôtre ?
          Nous gérons les réservations, l&apos;entretien et le suivi au
          quotidien.
        </p>

        <div className="de-hero-actions">
          <Link
            href={PUBLIC_ROUTES.vehicles}
            className="de-btn de-btn-primary de-btn-lg de-hero-btn"
          >
            Voir les véhicules
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
          <Link
            href={PUBLIC_ROUTES.owners}
            className="de-btn de-btn-ghost de-btn-lg de-hero-btn de-hero-btn-outline"
          >
            Confier mon véhicule
          </Link>
        </div>
      </div>
    </section>
  );
}
