import Link from "next/link";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import HeroBackground from "@/src/components/public/hero-background";

type HeroSectionProps = {
  imageUrl?: string | null;
};

export default function HeroSection({ imageUrl }: HeroSectionProps) {
  return (
    <section className="de-hero de-hero--photo">
      <HeroBackground imageUrl={imageUrl} />

      <div className="de-public-container de-hero-bar">
        <div className="de-hero-bar-copy">
          <p className="de-hero-eyebrow">
            Conciergerie automobile · {formatServiceAreaLabel()} · 24h/24
          </p>
          <h1 className="de-display de-hero-title">DreΛm Effect</h1>
          <p className="de-hero-lede">
            Location et gestion de véhicules haut de gamme.
          </p>
          <p className="de-hero-subtitle">
            Flotte préparée à Beauvais et Gisors. Réservation par WhatsApp,
            remise des clés sous 24 h.
          </p>
        </div>

        <div className="de-hero-bar-actions">
          <Link
            href={PUBLIC_ROUTES.vehicles}
            className="de-btn de-btn-primary de-btn-lg"
          >
            Catalogue
          </Link>
          <Link
            href={CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="de-text-link"
          >
            WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
