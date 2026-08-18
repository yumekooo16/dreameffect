import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";

type HeroSectionProps = {
  imageUrl?: string | null;
};

export default function HeroSection({ imageUrl }: HeroSectionProps) {
  const resolved = resolveVehicleImageUrl(imageUrl);

  return (
    <section className="de-hero de-hero--editorial">
      <div className="de-public-container de-hero-editorial">
        <div className="de-hero-editorial-copy">
          <p className="de-hero-eyebrow">
            Conciergerie automobile · {formatServiceAreaLabel()}
          </p>
          <h1 className="de-display de-hero-title">
            Location et gestion de véhicules haut de gamme.
          </h1>
          <p className="de-hero-subtitle">
            Flotte préparée à Beauvais et Gisors. Réservation par WhatsApp,
            remise des clés sous 24 h.
          </p>
          <div className="de-hero-actions">
            <Link
              href={PUBLIC_ROUTES.vehicles}
              className="de-btn de-btn-primary de-btn-lg"
            >
              Voir la flotte
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="de-btn de-btn-ghost de-btn-lg"
            >
              <MessageCircle size={18} strokeWidth={2} />
              WhatsApp
            </Link>
          </div>
        </div>

        <div className="de-hero-editorial-media">
          {resolved ? (
            <Image
              src={resolved}
              alt="Véhicule de la flotte DreamEffect"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          ) : (
            <div className="de-hero-editorial-fallback" />
          )}
        </div>
      </div>
    </section>
  );
}
