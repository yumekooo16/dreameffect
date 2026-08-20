import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import OwnersFigures from "@/src/components/public/owners-figures";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { PUBLIC_ROUTES, SITE_NAME } from "@/src/lib/public/site";

type OwnersHeroProps = {
  imageUrl?: string | null;
  vehicles?: PublicVehicle[];
};

export default function OwnersHero({ imageUrl, vehicles = [] }: OwnersHeroProps) {
  const stripUrls = vehicles
    .slice(0, 3)
    .map((v) => resolveVehicleImageUrl(v.image_url))
    .filter(Boolean) as string[];

  return (
    <>
      <section className="de-keys-hero" aria-labelledby="owners-hero-title">
        <div className="de-keys-hero-copy">
          <p className="de-keys-kicker">Propriétaires · Beauvais · Gisors</p>
          <h1 id="owners-hero-title" className="de-keys-title">
            Votre véhicule travaille.
            <em> Vous n&apos;avez plus à le gérer.</em>
          </h1>
          <p className="de-keys-lead">
            Réservations, remises de clés, nettoyage et suivi. Revenus consultables
            chaque mois, sans charge opérationnelle.
          </p>
          <div className="de-keys-actions">
            <Link
              href="#proprietaire-contact"
              className="de-btn de-btn-primary de-btn-lg"
            >
              Confier mon véhicule
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
            </Link>
            <Link href={PUBLIC_ROUTES.contact} className="de-btn de-btn-outline">
              Échanger d&apos;abord
            </Link>
          </div>
          <OwnersFigures />
          <p className="de-keys-sign">{SITE_NAME}</p>
        </div>
        <div className="de-keys-media">
          <HeroBackground imageUrl={imageUrl} />
          <p className="de-keys-media-cap">Gestion locative · Clé en main</p>
        </div>
      </section>

      {stripUrls.length > 0 ? (
        <div className="de-keys-strip" aria-hidden>
          {stripUrls.map((url) => (
            <div key={url} className="de-keys-strip-item">
              <Image src={url} alt="" fill className="object-cover" sizes="33vw" />
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
