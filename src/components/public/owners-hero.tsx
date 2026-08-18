import Link from "next/link";
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
          <p className="de-hero-eyebrow">Propriétaires</p>
          <h1 className="de-display de-hero-title">
            Confiez votre véhicule.
          </h1>
          <p className="de-hero-lede">Conservez les revenus.</p>
          <p className="de-hero-subtitle">
            Réservations, remises de clés, préparation et suivi : DreamEffect
            s&apos;en charge. Vous consultez vos revenus chaque mois.
          </p>
        </div>
        <div className="de-hero-bar-actions">
          <Link
            href="#proprietaire-contact"
            className="de-btn de-btn-primary de-btn-lg"
          >
            Nous écrire
          </Link>
        </div>
      </div>
    </section>
  );
}
