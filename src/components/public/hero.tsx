import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import HeroBackground from "@/src/components/public/hero-background";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type HeroSectionProps = {
  imageUrl?: string | null;
};

const TICKER_ITEMS = [
  "Beauvais",
  "Gisors",
  "Oise",
  "Eure",
  "Flotte entretenue",
  "Tarifs affichés",
  "WhatsApp",
  "Gestion locative",
];

function Ticker() {
  const sequence = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="de-ticker" aria-hidden>
      <div className="de-ticker-track">
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection({ imageUrl }: HeroSectionProps) {
  return (
    <section className="de-exhibit de-exhibit--hero" aria-labelledby="home-hero-title">
      <div className="de-exhibit-watermark" aria-hidden>
        DE
      </div>

      <div className="de-public-container de-exhibit-grid">
        <div className="de-exhibit-copy">
          <p className="de-mono-label">Beauvais · Gisors · Oise · Eure</p>
          <h1 id="home-hero-title" className="de-exhibit-title">
            <span>La location</span>
            <span className="de-exhibit-title-outline">haut de gamme</span>
            <span>sans le spectacle</span>
          </h1>
          <p className="de-exhibit-lead">
            Véhicules préparés, tarifs affichés, remise des clés sous 24 h.
            Propriétaires : nous gérons tout, vous percevez vos revenus.
          </p>
          <div className="de-exhibit-actions">
            <Link href={PUBLIC_ROUTES.vehicles} className="de-btn de-btn-primary de-btn-lg">
              Explorer la collection
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
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

        <div className="de-exhibit-frame">
          <div className="de-exhibit-frame-inner">
            <HeroBackground imageUrl={imageUrl} />
          </div>
          <span className="de-exhibit-tag">Collection · Oise &amp; Eure</span>
        </div>
      </div>

      <Ticker />
    </section>
  );
}
