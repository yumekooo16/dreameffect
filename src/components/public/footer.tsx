import Image from "next/image";
import Link from "next/link";
import FooterLegalLinks from "@/src/components/public/footer-legal-links";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

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
                alt="DreΛm Effect"
                width={40}
                height={40}
                className="rounded-xl object-contain"
              />
              <div>
                <p className="de-display de-wordmark text-sm">DreΛm Effect</p>
                <p className="text-xs de-muted">Conciergerie automobile</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed de-muted">
              Location et gestion de véhicules haut de gamme, pour locataires
              et propriétaires exigeants.
            </p>
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
