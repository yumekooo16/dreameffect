import Link from "next/link";
import Image from "next/image";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";

type OwnersHeroProps = {
  imageUrl?: string | null;
};

export default function OwnersHero({ imageUrl }: OwnersHeroProps) {
  const resolved = resolveVehicleImageUrl(imageUrl);

  return (
    <section className="de-hero de-hero--editorial de-hero--owners">
      <div className="de-public-container de-hero-editorial">
        <div className="de-hero-editorial-copy">
          <p className="de-hero-eyebrow">Propriétaires</p>
          <h1 className="de-display de-hero-title">
            Confiez votre véhicule, conservez les revenus.
          </h1>
          <p className="de-hero-subtitle">
            Réservations, remises de clés, préparation et suivi : DreamEffect
            s&apos;en charge. Vous consultez l&apos;activité chaque mois.
          </p>
          <div className="de-hero-actions">
            <Link
              href="#proprietaire-contact"
              className="de-btn de-btn-primary de-btn-lg"
            >
              Nous écrire
            </Link>
          </div>
        </div>

        <div className="de-hero-editorial-media">
          {resolved ? (
            <Image
              src={resolved}
              alt="Véhicule confié en gestion locative DreamEffect"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          ) : (
            <div className="de-hero-editorial-fallback" />
          )}
        </div>
      </div>
    </section>
  );
}
