import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OwnersHero() {
  return (
    <section className="de-hero de-owners-hero">
      <div className="de-hero-visual" aria-hidden>
        <div className="de-hero-visual-overlay" />
      </div>

      <div className="de-public-container de-hero-content">
        <p className="de-hero-eyebrow">Propriétaires</p>

        <h1 className="de-display de-hero-title">
          Rentabilisez votre véhicule
          <br />
          sans vous en occuper.
        </h1>

        <p className="de-hero-subtitle">
          DreamEffect s&apos;occupe de la gestion complète de votre voiture
          pendant que vous percevez vos revenus.
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
