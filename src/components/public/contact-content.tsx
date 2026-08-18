import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/src/components/public/contact-form";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_WHATSAPP_URL,
  SOCIAL_LINKS,
} from "@/src/lib/public/contact";
import { SERVICE_AREAS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";

export default function ContactContent() {
  const socialEntries = Object.entries(SOCIAL_LINKS).filter(
    ([, url]) => url != null
  );

  return (
    <section className="de-section">
      <div className="de-public-container">
        <div className="de-contact-page-layout">
          <div className="de-contact-form-block">
            <p className="de-section-eyebrow">Message</p>
            <h2 className="de-display text-xl sm:text-2xl">
              Écrivez-nous
            </h2>
            <p className="mt-2 text-sm de-muted">
              Nous vous répondons sous 24 h, ou le jour même sur WhatsApp.
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
              Vous préférez un échange direct ? Voici nos coordonnées.
            </p>

            <div className="de-contact-sidebar-cards">
              <div className="de-contact-card">
                <span className="de-contact-icon">
                  <Phone size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="de-label">Téléphone</p>
                  <a
                    href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
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
                <h3 className="de-display mt-4 text-lg">
                  WhatsApp
                </h3>
                <p className="mt-2 text-sm leading-relaxed de-muted">
                  Une conversation directe, sans passer par le formulaire.
                </p>
                <Link
                  href={CONTACT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="de-btn de-btn-ghost mt-5 w-full justify-center"
                >
                  <MessageCircle size={18} strokeWidth={2} />
                  Écrire sur WhatsApp
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
      </div>
    </section>
  );
}
