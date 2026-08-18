import Link from "next/link";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import HeroBackground from "@/src/components/public/hero-background";

type OwnersHeroProps = {
  imageUrl?: string | null;
};

export default function OwnersHero({ imageUrl }: OwnersHeroProps) {
  return (
    <section className="de-hero de-hero--photo de-owners-hero">
      <HeroBackground imageUrl={imageUrl} />

      <div className="de-public-container de-hero-bar">
        <div className="de-hero-bar-copy">
          <p className="de-hero-eyebrow">
            Propriétaires · {formatServiceAreaLabel()}
          </p>
          <h1 className="de-display de-hero-title">
            Rentabilisez, sans vous en occuper.
          </h1>
          <p className="de-hero-subtitle">
            Réservations, clés, nettoyage et suivi. Vos revenus, chaque mois,
            consultables en ligne.
          </p>
        </div>
        <Link href="#proprietaire-contact" className="de-btn de-btn-primary de-btn-lg">
          Confier mon véhicule
        </Link>
      </div>
    </section>
  );
}
