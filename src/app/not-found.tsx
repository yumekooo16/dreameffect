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
    <div className="de-page de-landing">
      <PublicHeader />
      <main id="main-content">
        <section className="de-page-hero">
          <div className="de-public-container">
            <p className="de-hero-eyebrow">Erreur 404</p>
            <h1 className="de-display de-page-hero-title">Page introuvable</h1>
            <p className="de-page-hero-description">
              Cette page n&apos;existe pas ou a été déplacée. Retournez à
              l&apos;accueil ou parcourez notre catalogue.
            </p>
            <div className="de-hero-actions mt-8">
              <Link href={PUBLIC_ROUTES.home} className="de-btn de-btn-primary de-btn-lg">
                Retour à l&apos;accueil
              </Link>
              <Link
                href={PUBLIC_ROUTES.vehicles}
                className="de-btn de-btn-ghost de-btn-lg de-hero-btn-outline"
              >
                Voir les véhicules
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
