import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";

type OwnersHeroProps = {
  imageUrl?: string | null;
};

export default function OwnersHero({ imageUrl }: OwnersHeroProps) {
  return (
    <section className="de-hero de-hero--photo de-owners-hero">
      <HeroBackground imageUrl={imageUrl} />

      <div className="de-public-container de-hero-content">
        <p className="de-hero-eyebrow de-hero-location-badge">
          Propriétaires · {formatServiceAreaLabel()}
        </p>

        <h1 className="de-display de-hero-title">
          Rentabilisez votre véhicule
          <br />
          sans vous en occuper.
        </h1>

        <p className="de-hero-subtitle">
          DreamEffect gère réservations, remises de clés, nettoyage et suivi.
          Vous percevez vos revenus chaque mois — revenus consultables en ligne,
          sans charge opérationnelle.
        </p>

        <div className="de-hero-actions">
          <Link
            href="#proprietaire-contact"
            className="de-btn de-btn-primary de-btn-lg de-hero-btn"
          >
            Confier mon véhicule
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
