import Link from "next/link";
import { ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/src/components/public/contact-form";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsEmbedUrl,
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
  const mapsEmbedUrl = buildGoogleMapsEmbedUrl();
  const hoursLabel = `Tous les jours, ${OPENING_HOURS.opens.replace(":", " h ")} – ${OPENING_HOURS.closes.replace(":", " h ")}`;

  return (
    <section className="de-section">
      <div className="de-public-container">
        <div className="de-locale-row">
          {SERVICE_POINTS.map((point) => (
            <address key={point.city} className="de-locale-cell not-italic">
              <p className="de-locale-city de-display">{point.city}</p>
              <p className="de-locale-code">{point.postalCode}</p>
              <p className="de-mono-label" style={{ marginTop: "0.35rem" }}>
                {point.region}
              </p>
            </address>
          ))}
        </div>

        <div className="de-contact-split">
          <div>
            <p className="de-mono-label">Formulaire</p>
            <h2 className="de-display de-exhibit-head-title">Écrivez-nous</h2>
            <p className="de-exhibit-head-lede" style={{ marginTop: "0.75rem" }}>
              Réponse sous 24 h ouvrées.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside>
            <p className="de-mono-label">Direct</p>
            <p className="de-exhibit-head-lede">{hoursLabel}</p>
            <p className="de-exhibit-head-lede" style={{ marginTop: "0.75rem" }}>
              Remise des clés à Beauvais, Gisors, ou sur rendez-vous dans
              l&apos;Oise et l&apos;Eure.
            </p>

            <a href={telHref()} className="de-contact-direct">
              <Phone size={18} strokeWidth={1.75} aria-hidden />
              <span>
                <span className="de-label">Téléphone</span>
                {CONTACT_PHONE}
              </span>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="de-contact-direct">
              <Mail size={18} strokeWidth={1.75} aria-hidden />
              <span>
                <span className="de-label">Email</span>
                {CONTACT_EMAIL}
              </span>
            </a>

            <Link
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="de-btn de-btn-primary de-contact-whatsapp"
              aria-label="Ouvrir WhatsApp"
            >
              <MessageCircle size={18} strokeWidth={1.75} aria-hidden />
              WhatsApp
            </Link>

            <div className="de-contact-links">
              <a
                href={buildGoogleMapsDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="de-text-cta"
              >
                Itinéraire
                <ExternalLink size={14} aria-hidden />
              </a>
              <a
                href={GOOGLE_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="de-text-cta"
              >
                Fiche Google
                <ExternalLink size={14} aria-hidden />
              </a>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="de-text-cta"
              >
                Avis Google
                <ExternalLink size={14} aria-hidden />
              </a>
            </div>

            {socialEntries.length > 0 && (
              <div className="de-contact-social-block">
                <p className="de-mono-label">Réseaux</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialEntries.map(([network, url]) => (
                    <Link
                      key={network}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="de-text-cta capitalize"
                    >
                      {network}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {mapsEmbedUrl ? (
          <div className="de-contact-map-block" style={{ marginTop: "3rem" }}>
            <h2 className="de-display de-exhibit-head-title">Nous trouver</h2>
            <div className="de-contact-map-embed">
              <iframe
                title="Localisation DreamEffect sur Google Maps"
                src={mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
