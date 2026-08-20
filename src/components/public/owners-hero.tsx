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
    <section className="de-exhibit de-exhibit--hero de-owners-hero" aria-labelledby="owners-hero-title">
      <div className="de-exhibit-watermark" aria-hidden>
        PR
      </div>

      <div className="de-public-container de-exhibit-grid">
        <div className="de-exhibit-copy">
          <p className="de-mono-label">Propriétaires · Beauvais · Gisors</p>
          <h1 id="owners-hero-title" className="de-exhibit-title">
            <span>Votre véhicule</span>
            <span className="de-exhibit-title-outline">travaille</span>
            <span>pour vous</span>
          </h1>
          <p className="de-exhibit-lead">
            Réservations, remises de clés, nettoyage et suivi. Revenus consultables
            chaque mois, sans charge opérationnelle.
          </p>
          <div className="de-exhibit-actions">
            <Link
              href="#proprietaire-contact"
              className="de-btn de-btn-primary de-btn-lg"
            >
              Confier mon véhicule
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
            </Link>
            <Link href={PUBLIC_ROUTES.contact} className="de-text-cta">
              Échanger d&apos;abord
            </Link>
          </div>
          <OwnersFigures />
        </div>

        <div className="de-exhibit-frame">
          <div className="de-exhibit-frame-inner">
            <HeroBackground imageUrl={imageUrl} />
          </div>
          <span className="de-exhibit-tag">Gestion locative</span>
        </div>
      </div>
    </section>
  );
}
