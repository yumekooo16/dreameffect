import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import OwnersFigures from "@/src/components/public/owners-figures";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

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
      <section className="de-motion-hero de-motion-owners-hero" aria-labelledby="owners-hero-title">
        <div className="de-motion-hero-bg">
          <HeroBackground imageUrl={imageUrl} />
        </div>
        <div className="de-motion-hero-content de-public-container">
          <p className="de-motion-hero-zone">Propriétaires · Beauvais · Gisors</p>
          <h1 id="owners-hero-title" className="de-motion-hero-title">
            Gestion locative
          </h1>
          <p className="de-motion-hero-lead">
            Votre véhicule travaille. Réservations, remises de clés, nettoyage et
            suivi — revenus consultables chaque mois, sans charge opérationnelle.
          </p>
          <div className="de-motion-hero-actions">
            <Link href="#proprietaire-contact" className="de-btn de-btn-primary de-btn-lg">
              Confier mon véhicule
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
            </Link>
            <Link href={PUBLIC_ROUTES.contact} className="de-btn de-btn-outline">
              Échanger d&apos;abord
            </Link>
          </div>
          <OwnersFigures />
        </div>
      </section>

      {stripUrls.length > 0 && (
        <div className="de-motion-owners-strip" aria-hidden>
          {stripUrls.map((url, index) => (
            <div key={url} className="de-motion-owners-strip-item">
              <Image src={url} alt="" fill className="object-cover" sizes="33vw" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
