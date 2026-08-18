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
                alt="DreamEffect"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <p className="de-display text-xl font-light">DreamEffect</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Location et gestion
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed de-muted">
              Mise en location et gestion de véhicules pour propriétaires et
              locataires exigeants.
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
