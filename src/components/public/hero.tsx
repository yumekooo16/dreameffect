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
    <section className="de-hero de-hero--photo">
      <HeroBackground imageUrl={imageUrl} />

      <div className="de-public-container de-hero-content de-hero-content--wide">
        <p className="de-hero-eyebrow de-hero-location-badge">
          {formatServiceAreaLabel()} · 24h/24
        </p>

        <h1 className="de-display de-hero-title">
          Louez ou faites rentabiliser un véhicule haut de gamme.
        </h1>

        <p className="de-hero-subtitle">
          Flotte entretenue à Beauvais et Gisors. Réservation en ligne,
          remise des clés sous 24 h, gestion locative clé en main pour les
          propriétaires.
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
            className="de-btn de-btn-ghost de-btn-lg de-hero-btn de-hero-btn-outline"
          >
            <MessageCircle size={18} strokeWidth={2} />
            WhatsApp direct
          </Link>
        </div>
      </div>
    </section>
  );
}
