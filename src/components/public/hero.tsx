import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { PUBLIC_ROUTES, SITE_NAME } from "@/src/lib/public/site";

type HeroSectionProps = {
  imageUrl?: string | null;
};

export default function HeroSection({ imageUrl }: HeroSectionProps) {
  return (
    <section className="de-motion-hero" aria-labelledby="home-hero-title">
      <div className="de-motion-hero-bg">
        <HeroBackground imageUrl={imageUrl} />
      </div>

      <div className="de-motion-hero-content de-public-container">
        <p className="de-motion-hero-zone">
          Beauvais · Gisors · Oise · Eure · Réponse sous 24 h
        </p>
        <h1 id="home-hero-title" className="de-motion-hero-title">
          {SITE_NAME}
        </h1>
        <p className="de-motion-hero-lead">
          Location et gestion de véhicules haut de gamme. Flotte entretenue,
          tarifs affichés, remise des clés sur rendez-vous.
        </p>
        <div className="de-motion-hero-actions">
          <Link href={PUBLIC_ROUTES.vehicles} className="de-btn de-btn-primary de-btn-lg">
            Voir la flotte
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
          </Link>
          <Link href={PUBLIC_ROUTES.owners} className="de-btn de-btn-outline">
            Confier mon véhicule
          </Link>
          <Link
            href={CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="de-motion-hero-wa"
            aria-label="Ouvrir WhatsApp"
          >
            <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
            WhatsApp
          </Link>
        </div>
      </div>

      <div className="de-motion-hero-scroll" aria-hidden>
        <span>Défiler</span>
      </div>
    </section>
  );
}
