import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES, SITE_NAME } from "@/src/lib/public/site";
import type { VehicleImageFrame } from "@/src/lib/vehicles/image-frame";

type HeroSectionProps = {
  imageUrl?: string | null;
  imageFrame?: VehicleImageFrame | null;
};

export default function HeroSection({ imageUrl, imageFrame }: HeroSectionProps) {
  const centeredFrame: VehicleImageFrame = {
    fit: imageFrame?.fit === "contain" ? "contain" : "cover",
    positionX: 50,
    positionY: 50,
    scale: imageFrame?.scale ?? 100,
  };

  return (
    <section
      className="de-keys-hero de-keys-hero--stage"
      aria-labelledby="home-hero-brand"
    >
      <div className="de-keys-hero-stage" aria-hidden={imageUrl ? undefined : true}>
        <HeroBackground imageUrl={imageUrl} frame={centeredFrame} />
      </div>

      <div className="de-keys-hero-copy">
        <p id="home-hero-brand" className="de-keys-brand">
          {SITE_NAME}
        </p>
        <p className="de-keys-kicker">{formatServiceAreaLabel()}</p>
        <h1 id="home-hero-title" className="de-keys-title">
          Confiez. Louez.
          <em> On s&apos;occupe du reste.</em>
        </h1>
        <p className="de-keys-lead">
          Location et gestion de véhicules haut de gamme. Flotte préparée, tarifs
          affichés, remise des clés sur rendez-vous — Beauvais, Gisors et
          Île-de-France.
        </p>
        <div className="de-keys-actions">
          <Link
            href={PUBLIC_ROUTES.vehicles}
            className="de-btn de-btn-primary de-btn-lg"
          >
            Voir la flotte
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
        <p className="de-keys-media-cap de-keys-media-cap--stage">
          Flotte entretenue · Remise sous 24 h ·{" "}
          <Link href={PUBLIC_ROUTES.owners} className="de-keys-link-inline">
            Confier mon véhicule
          </Link>
        </p>
      </div>
    </section>
  );
}
