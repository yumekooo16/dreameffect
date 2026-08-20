import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import OwnersFigures from "@/src/components/public/owners-figures";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type OwnersHeroProps = {
  imageUrl?: string | null;
};

export default function OwnersHero({ imageUrl }: OwnersHeroProps) {
  return (
    <section className="de-hero de-hero--split de-owners-hero">
      <div className="de-hero-copy">
        <div className="de-hero-copy-inner">
          <p className="de-hero-kicker">Propriétaires · Beauvais · Gisors</p>
          <h1 className="de-display de-hero-title">
            Votre véhicule travaille.
            <em> Vous n’avez plus à le gérer.</em>
          </h1>
          <p className="de-hero-subtitle">
            Réservations, remises de clés, nettoyage et suivi. Revenus
            consultables chaque mois, sans charge opérationnelle.
          </p>
          <div className="de-hero-actions">
            <Link
              href="#proprietaire-contact"
              className="de-btn de-btn-primary de-btn-lg"
            >
              Confier mon véhicule
              <ArrowRight size={18} strokeWidth={1.75} />
            </Link>
            <Link href={PUBLIC_ROUTES.contact} className="de-text-cta">
              Échanger d&apos;abord
            </Link>
          </div>
          <OwnersFigures />
        </div>
      </div>
      <div className="de-hero-media">
        <HeroBackground imageUrl={imageUrl} />
      </div>
    </section>
  );
}
