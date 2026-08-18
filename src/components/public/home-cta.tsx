import Link from "next/link";
import { CONTACT_PHONE, CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeCtaSection() {
  return (
    <section className="de-home-cta-editorial">
      <div className="de-public-container">
        <p className="de-hero-eyebrow">Prendre contact</p>
        <h2 className="de-display de-home-cta-title">
          Une location, ou une mise en gestion.{" "}
          <span className="de-home-cta-title-muted">Quand vous le décidez.</span>
        </h2>
        <div className="de-home-cta-editorial-actions">
          <Link href={PUBLIC_ROUTES.contact} className="de-btn de-btn-primary de-btn-lg">
            Demander un devis
          </Link>
          <Link
            href={CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="de-text-link"
          >
            WhatsApp
          </Link>
          <Link href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="de-text-link">
            {CONTACT_PHONE}
          </Link>
        </div>
      </div>
    </section>
  );
}
