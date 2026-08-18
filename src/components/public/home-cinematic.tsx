import Link from "next/link";
import Image from "next/image";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type HomeCinematicProps = {
  imageUrl?: string | null;
};

export default function HomeCinematic({ imageUrl }: HomeCinematicProps) {
  const resolved = resolveVehicleImageUrl(imageUrl);

  return (
    <section className="de-cinematic">
      <div className="de-cinematic-media">
        {resolved ? (
          <Image
            src={resolved}
            alt="Gestion locative DreamEffect — véhicule préparé pour la location"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div className="de-cinematic-fallback" />
        )}
        <div className="de-cinematic-overlay" />
      </div>
      <div className="de-public-container de-cinematic-bar">
        <div>
          <p className="de-hero-eyebrow">Propriétaires</p>
          <h2 className="de-display de-cinematic-title">
            Votre véhicule travaille. Vous n&apos;avez rien à gérer.
          </h2>
          <p className="de-cinematic-text">
            Réservations, clés, nettoyage et suivi : nous prenons l&apos;exploitation.
            Vous consultez vos revenus chaque mois.
          </p>
        </div>
        <Link href={PUBLIC_ROUTES.owners} className="de-btn de-btn-ghost de-btn-lg">
          Espace propriétaires
        </Link>
      </div>
    </section>
  );
}
