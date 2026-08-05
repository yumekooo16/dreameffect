import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import {
  CONTACT_PHONE,
  CONTACT_WHATSAPP_URL,
} from "@/src/lib/public/contact";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeCtaSection() {
  return (
    <section className="de-section de-home-cta">
      <div className="de-public-container">
        <div className="de-home-cta-panel">
          <div className="de-home-cta-content">
            <p className="de-section-eyebrow">Contact</p>
            <h2 className="de-display de-home-cta-title">
              Réservez ou confiez votre véhicule
            </h2>
            <p className="de-home-cta-text">
              Disponibles {formatServiceAreaLabel()}. Réponse le jour même par
              WhatsApp, sous 24 h via le formulaire. Propriétaires : premier
              échange gratuit pour évaluer le potentiel locatif de votre
              véhicule.
            </p>
          </div>

          <div className="de-home-cta-actions">
            <Link
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="de-btn de-btn-primary de-btn-lg w-full justify-center sm:w-auto"
            >
              <MessageCircle size={18} strokeWidth={2} />
              Ouvrir WhatsApp
            </Link>
            <Link
              href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
              className="de-btn de-btn-ghost de-btn-lg w-full justify-center sm:w-auto"
            >
              <Phone size={18} strokeWidth={2} />
              {CONTACT_PHONE}
            </Link>
            <Link
              href={PUBLIC_ROUTES.contact}
              className="de-link-inline inline-flex items-center gap-1.5 text-sm"
            >
              Formulaire de contact
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
