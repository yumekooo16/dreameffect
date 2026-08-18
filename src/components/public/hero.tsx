import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type HeroSectionProps = {
  imageUrl?: string | null;
};

export default function HeroSection({ imageUrl }: HeroSectionProps) {
  return (
    <section className="de-hero de-hero--split de-hero--photo">
      <div className="de-hero-media">
        <HeroBackground imageUrl={imageUrl} />
      </div>

      <div className="de-hero-copy">
        <div className="de-public-container de-hero-content">
          <p className="de-hero-eyebrow">{formatServiceAreaLabel()}</p>

          <h1 className="de-display de-hero-title">
            Location et gestion de véhicules haut de gamme.
          </h1>

          <p className="de-hero-subtitle">
            Flotte préparée à Beauvais et Gisors. Réservation par WhatsApp,
            remise des clés sous 24 h. Propriétaires : nous gérons
            l&apos;exploitation, vous percevez les revenus.
          </p>

          <div className="de-hero-actions">
            <Link
              href={PUBLIC_ROUTES.vehicles}
              className="de-btn de-btn-primary de-btn-lg de-hero-btn"
            >
              Voir les véhicules
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="de-btn de-btn-ghost de-btn-lg de-hero-btn"
            >
              <MessageCircle size={18} strokeWidth={2} />
              WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
