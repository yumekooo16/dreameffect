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
    <section className="de-keys-hero" aria-labelledby="home-hero-title">
      <div className="de-keys-hero-copy">
        <p className="de-keys-kicker">Beauvais · Gisors · Oise · Eure</p>
        <h1 id="home-hero-title" className="de-keys-title">
          Confiez. Louez.
          <em> On s&apos;occupe du reste.</em>
        </h1>
        <p className="de-keys-lead">
          Location et gestion de véhicules haut de gamme. Flotte préparée, tarifs
          affichés, remise des clés sur rendez-vous — pour locataires et
          propriétaires.
        </p>
        <div className="de-keys-actions">
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
            className="de-keys-link"
            aria-label="Ouvrir WhatsApp"
            style={{ marginTop: 0 }}
          >
            <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
            WhatsApp
          </Link>
        </div>
        <p className="de-keys-sign">{SITE_NAME}</p>
      </div>

      <div className="de-keys-media">
        <HeroBackground imageUrl={imageUrl} />
        <p className="de-keys-media-cap">Flotte entretenue · Remise sous 24 h</p>
      </div>
    </section>
  );
}
