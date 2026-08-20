import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type HeroSectionProps = {
  imageUrl?: string | null;
};

export default function HeroSection({ imageUrl }: HeroSectionProps) {
  return (
    <section className="de-hero de-hero--split">
      <div className="de-hero-copy">
        <div className="de-hero-copy-inner">
          <p className="de-hero-kicker">Beauvais · Gisors</p>
          <h1 className="de-display de-hero-title">
            La location haut de gamme,
            <em> sans le spectacle.</em>
          </h1>
          <p className="de-hero-subtitle">
            Véhicules préparés, tarifs affichés, remise des clés sous 24 h.
            Propriétaires : nous gérons tout, vous percevez vos revenus.
          </p>
          <div className="de-hero-actions">
            <Link
              href={PUBLIC_ROUTES.vehicles}
              className="de-btn de-btn-primary de-btn-lg"
            >
              La flotte
              <ArrowRight size={18} strokeWidth={1.75} />
            </Link>
            <Link href={PUBLIC_ROUTES.owners} className="de-text-cta">
              Confier mon véhicule
            </Link>
            <Link
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="de-text-cta"
              aria-label="Ouvrir WhatsApp"
            >
              <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
              WhatsApp
            </Link>
          </div>
        </div>
      </div>

      <div className="de-hero-media">
        <HeroBackground imageUrl={imageUrl} />
        <p className="de-hero-media-caption">Flotte entretenue · Oise &amp; Eure</p>
      </div>
    </section>
  );
}
