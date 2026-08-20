import Link from "next/link";
import { ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/src/components/public/contact-form";
import {
  GOOGLE_BUSINESS_URL,
  GOOGLE_REVIEWS_URL,
  OPENING_HOURS,
  SERVICE_POINTS,
} from "@/src/lib/public/business";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_WHATSAPP_URL,
  SOCIAL_LINKS,
  telHref,
} from "@/src/lib/public/contact";

export default function ContactContent() {
  const socialEntries = Object.entries(SOCIAL_LINKS).filter(
    ([, url]) => url != null
  );
  const hoursLabel = `Tous les jours, ${OPENING_HOURS.opens.replace(":", " h ")} – ${OPENING_HOURS.closes.replace(":", " h ")}`;

  return (
    <section className="de-keys-section">
      <div className="de-public-container">
        <div className="de-keys-locales">
          {SERVICE_POINTS.map((point) => (
            <address key={point.city} className="de-keys-locale not-italic">
              <p className="de-keys-locale-city">{point.city}</p>
              <p className="de-keys-locale-code">{point.postalCode}</p>
              <p className="de-keys-eyebrow" style={{ marginTop: "0.4rem" }}>
                {point.region}
              </p>
            </address>
          ))}
        </div>

        <div className="de-keys-contact-grid">
          <div>
            <p className="de-keys-eyebrow">Formulaire</p>
            <h2 className="de-keys-h2">Écrivez-nous</h2>
            <p className="de-keys-lede">Réponse sous 24 h ouvrées.</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside>
            <p className="de-keys-eyebrow">Direct</p>
            <p className="de-keys-lede">{hoursLabel}</p>
            <p className="de-keys-lede">
              Remise des clés à Beauvais, Gisors, ou sur rendez-vous dans
              l&apos;Oise et l&apos;Eure.
            </p>

            <a href={telHref()} className="de-keys-direct">
              <Phone size={18} strokeWidth={1.75} aria-hidden />
              <span>
                <span className="de-label">Téléphone</span>
                <span className="de-keys-direct-value">{CONTACT_PHONE}</span>
              </span>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="de-keys-direct">
              <Mail size={18} strokeWidth={1.75} aria-hidden />
              <span>
                <span className="de-label">Email</span>
                <span className="de-keys-direct-value">{CONTACT_EMAIL}</span>
              </span>
            </a>

            <Link
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="de-btn de-btn-primary"
              style={{ marginTop: "1.5rem", width: "100%" }}
              aria-label="Ouvrir WhatsApp"
            >
              <MessageCircle size={18} strokeWidth={1.75} aria-hidden />
              WhatsApp
            </Link>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "1.5rem" }}>
              <a
                href={GOOGLE_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="de-keys-link"
                style={{ marginTop: 0 }}
              >
                Fiche Google
                <ExternalLink size={14} aria-hidden />
              </a>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="de-keys-link"
                style={{ marginTop: 0 }}
              >
                Avis Google
                <ExternalLink size={14} aria-hidden />
              </a>
            </div>

            {socialEntries.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <p className="de-keys-eyebrow">Réseaux</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialEntries.map(([network, url]) => (
                    <Link
                      key={network}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="de-keys-link capitalize"
                      style={{ marginTop: 0 }}
                    >
                      {network}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
