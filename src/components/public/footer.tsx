import Link from "next/link";
import FooterLegalLinks from "@/src/components/public/footer-legal-links";
import { SERVICE_POINTS } from "@/src/lib/public/business";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  telHref,
} from "@/src/lib/public/contact";
import { INFO_ROUTES, PUBLIC_ROUTES, SITE_NAME } from "@/src/lib/public/site";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="de-public-footer">
      <div className="de-public-container">
        <p className="de-footer-wordmark">{SITE_NAME}</p>
        <p className="de-footer-tagline">
          Location et gestion de véhicules haut de gamme — Beauvais &amp; Gisors
        </p>

        <div className="de-footer-editorial">
          <div>
            <p className="de-footer-col-label">Maison</p>
            <address className="de-footer-points not-italic">
              {SERVICE_POINTS.map((point) => (
                <span key={point.city} className="block">
                  {point.postalCode} {point.city}
                </span>
              ))}
            </address>
            <a href={telHref()} className="de-footer-phone">
              {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="de-footer-mail">
              {CONTACT_EMAIL}
            </a>
          </div>

          <nav aria-label="Navigation">
            <p className="de-footer-col-label">Explorer</p>
            <ul className="de-footer-links">
              <li>
                <Link href={PUBLIC_ROUTES.home}>Accueil</Link>
              </li>
              <li>
                <Link href={PUBLIC_ROUTES.vehicles}>Flotte</Link>
              </li>
              <li>
                <Link href={PUBLIC_ROUTES.owners}>Propriétaires</Link>
              </li>
              <li>
                <Link href={PUBLIC_ROUTES.contact}>Contact</Link>
              </li>
              <li>
                <Link href={PUBLIC_ROUTES.calendar}>
                  Calendrier des réservations
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Guides">
            <p className="de-footer-col-label">Guides</p>
            <ul className="de-footer-links">
              <li>
                <Link href={INFO_ROUTES.insurance}>Assurance</Link>
              </li>
              <li>
                <Link href={INFO_ROUTES.ownerManagement}>Gestion locative</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Informations légales">
            <p className="de-footer-col-label">Mentions</p>
            <FooterLegalLinks />
          </nav>
        </div>

        <div className="de-public-footer-bottom">
          <p>
            © {year} {SITE_NAME}
          </p>
          <p>
            Site réalisé par <span>Wyatt</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
