import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import {
  CONTACT_PHONE,
  CONTACT_WHATSAPP_URL,
  telHref,
} from "@/src/lib/public/contact";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeCtaSection() {
  return (
    <section className="de-keys-close">
      <div className="de-public-container de-keys-close-inner">
        <h2 className="de-keys-close-title">
          Réservez,
          <br />
          ou confiez le vôtre.
        </h2>
        <div className="de-keys-close-actions">
          <Link
            href={CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="de-btn de-btn-primary de-btn-lg"
            aria-label="Ouvrir WhatsApp"
          >
            <MessageCircle size={18} strokeWidth={1.75} aria-hidden />
            WhatsApp
          </Link>
          <Link
            href={telHref()}
            className="de-keys-link"
            style={{ marginTop: 0 }}
            aria-label={`Appeler le ${CONTACT_PHONE}`}
          >
            <Phone size={16} strokeWidth={1.75} aria-hidden />
            {CONTACT_PHONE}
          </Link>
          <Link href={PUBLIC_ROUTES.contact} className="de-keys-link" style={{ marginTop: 0 }}>
            Formulaire
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
