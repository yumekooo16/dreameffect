import Link from "next/link";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/src/components/public/contact-form";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsEmbedUrl,
  formatBusinessAddressLines,
  GOOGLE_BUSINESS_URL,
  OPENING_HOURS,
} from "@/src/lib/public/business";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_WHATSAPP_URL,
  SOCIAL_LINKS,
  telHref,
} from "@/src/lib/public/contact";
import { SERVICE_AREAS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";

export default function ContactContent() {
  const socialEntries = Object.entries(SOCIAL_LINKS).filter(
    ([, url]) => url != null
  );
  const mapsEmbedUrl = buildGoogleMapsEmbedUrl();
  const addressLines = formatBusinessAddressLines();

  return (
    <section className="de-section">
      <div className="de-public-container">
        <div className="de-contact-page-layout">
          <div className="de-contact-form-block">
            <h2 className="de-display text-xl tracking-tight sm:text-2xl">
              Envoyez-nous un message
            </h2>
            <p className="mt-2 text-sm de-muted">
              Remplissez le formulaire ci-dessous. On revient vers vous
              rapidement.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="de-contact-sidebar">
            <div className="de-contact-zone-card">
              <span className="de-contact-icon">
                <MapPin size={20} strokeWidth={1.75} />
              </span>
              <div>
                <p className="de-label">Adresse</p>
                <address className="mt-1 not-italic text-sm leading-relaxed">
                  {addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={buildGoogleMapsDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="de-link-inline mt-2 inline-flex items-center gap-1 text-sm"
                >
                  Itinéraire Google Maps
                  <ExternalLink size={14} aria-hidden />
                </a>
                {GOOGLE_BUSINESS_URL ? (
                  <a
                    href={GOOGLE_BUSINESS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="de-link-inline mt-1 inline-flex items-center gap-1 text-sm"
                  >
                    Fiche Google
                    <ExternalLink size={14} aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="de-contact-zone-card">
              <span className="de-contact-icon">
                <MapPin size={20} strokeWidth={1.75} />
              </span>
              <div>
                <p className="de-label">Zone d&apos;intervention</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {formatServiceAreaLabel()}
                </p>
                <ul className="de-contact-zone-list">
                  {SERVICE_AREAS.map((area) => (
                    <li key={area.name}>
                      {area.name}
                      {"department" in area && area.department
                        ? ` (${area.department})`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-sm leading-relaxed de-muted">
              Horaires : tous les jours de {OPENING_HOURS.opens.replace(":", " h ")} à{" "}
              {OPENING_HOURS.closes.replace(":", " h ")}.
            </p>

            <p className="text-sm leading-relaxed de-muted">
              Vous préférez nous joindre directement ? Voici nos coordonnées.
            </p>

            <div className="de-contact-sidebar-cards">
              <div className="de-contact-card">
                <span className="de-contact-icon">
                  <Phone size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="de-label">Téléphone</p>
                  <a
                    href={telHref()}
                    className="mt-1 block font-medium transition hover:text-[var(--blue-soft)]"
                  >
                    {CONTACT_PHONE}
                  </a>
                </div>
              </div>

              <div className="de-contact-card">
                <span className="de-contact-icon">
                  <Mail size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="de-label">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-1 block font-medium transition hover:text-[var(--blue-soft)]"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="de-contact-whatsapp-card">
                <span className="de-contact-icon">
                  <MessageCircle size={22} strokeWidth={1.75} />
                </span>
                <h3 className="de-display mt-4 text-lg tracking-tight">
                  WhatsApp direct
                </h3>
                <p className="mt-2 text-sm leading-relaxed de-muted">
                  Sans passer par le formulaire, ouvrez une conversation
                  directement.
                </p>
                <Link
                  href={CONTACT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="de-btn de-btn-ghost mt-5 w-full justify-center"
                >
                  <MessageCircle size={18} strokeWidth={2} />
                  Ouvrir WhatsApp
                </Link>
              </div>
            </div>

            {socialEntries.length > 0 && (
              <div className="de-contact-social-block">
                <p className="de-label">Réseaux sociaux</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialEntries.map(([network, url]) => (
                    <Link
                      key={network}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="de-btn de-btn-ghost capitalize"
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
          <div className="de-contact-map-block">
            <h2 className="de-display text-xl tracking-tight sm:text-2xl">
              Nous trouver
            </h2>
            <p className="mt-2 text-sm de-muted">
              Rendez-vous sur place ou convenez d&apos;un lieu de remise des clés dans
              l&apos;Oise et l&apos;Eure.
            </p>
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
