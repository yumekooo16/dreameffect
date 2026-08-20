import Image from "next/image";
import Link from "next/link";
import FooterLegalLinks from "@/src/components/public/footer-legal-links";
import {
  formatBusinessAddressLines,
} from "@/src/lib/public/business";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  telHref,
} from "@/src/lib/public/contact";
import { PUBLIC_ROUTES, SITE_NAME } from "@/src/lib/public/site";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="de-public-footer">
      <div className="de-public-container">
        <div className="de-public-footer-grid">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={SITE_NAME}
                width={40}
                height={40}
                className="rounded-xl object-contain"
              />
              <div>
                <p className="de-display text-sm tracking-tight">{SITE_NAME}</p>
                <p className="text-xs de-muted">Location & gestion automobile</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed de-muted">
              Mise en location et gestion de véhicules pour propriétaires et
              locataires exigeants.
            </p>
            <address className="de-footer-nap mt-4 not-italic">
              {formatBusinessAddressLines().map((line) => (
                <span key={line} className="block text-sm de-muted">
                  {line}
                </span>
              ))}
              <a
                href={telHref()}
                className="mt-2 block text-sm font-medium transition hover:text-[var(--blue-soft)]"
              >
                {CONTACT_PHONE}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-1 block text-sm transition hover:text-[var(--blue-soft)] de-muted"
              >
                {CONTACT_EMAIL}
              </a>
            </address>
          </div>

          <nav aria-label="Navigation footer">
            <p className="de-label mb-3">Navigation</p>
            <ul className="de-footer-links">
              <li>
                <Link href={PUBLIC_ROUTES.home}>Accueil</Link>
              </li>
              <li>
                <Link href={PUBLIC_ROUTES.vehicles}>Véhicules</Link>
              </li>
              <li>
                <Link href={PUBLIC_ROUTES.owners}>Propriétaires</Link>
              </li>
              <li>
                <Link href={PUBLIC_ROUTES.contact}>Contact</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Informations légales">
            <p className="de-label mb-3">Informations</p>
            <FooterLegalLinks />
          </nav>
        </div>

        <div className="de-public-footer-divider" />

        <div className="de-public-footer-bottom">
          <p>© {year} DreamEffect. Tous droits réservés.</p>
          <p>
            Site réalisé par{" "}
            <span className="text-foreground">Wyatt</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
