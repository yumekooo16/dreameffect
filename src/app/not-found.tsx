import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/src/components/public/header";
import PublicFooter from "@/src/components/public/footer";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Page introuvable",
  description: "La page demandée n'existe pas ou n'est plus disponible.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="de-maison">
      <PublicHeader />
      <div className="de-page de-landing de-maison-shell">
        <main id="main-content">
          <section className="de-keys-page-hero">
            <div className="de-public-container">
              <p className="de-keys-kicker">Erreur 404</p>
              <h1 id="page-hero-title" className="de-keys-page-title">
                Page introuvable
              </h1>
              <p className="de-keys-page-lead">
                Cette page n&apos;existe pas, ou a été déplacée. Retournez à
                l&apos;accueil, ou parcourez le catalogue.
              </p>
              <div className="de-keys-actions" style={{ marginTop: "1.75rem" }}>
                <Link
                  href={PUBLIC_ROUTES.home}
                  className="de-btn de-btn-primary de-btn-lg"
                >
                  Retour à l&apos;accueil
                </Link>
                <Link
                  href={PUBLIC_ROUTES.vehicles}
                  className="de-btn de-btn-outline"
                >
                  Découvrir la flotte
                </Link>
              </div>
            </div>
          </section>
        </main>
        <PublicFooter />
      </div>
    </div>
  );
}
