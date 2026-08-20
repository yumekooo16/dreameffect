import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InfoArticle, InfoCta } from "@/src/components/public/info-article";
import PageHero from "@/src/components/public/page-hero";
import { INSURANCE_INFO_BLOCKS } from "@/src/lib/public/info-content";
import { CATALOG_KEYWORDS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { INFO_ROUTES, PUBLIC_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Assurance et location de véhicule premium",
  description: `Assurance, caution et conditions pour louer un véhicule haut de gamme avec DreamEffect (${formatServiceAreaLabel()}). Transparence avant réservation.`,
  path: INFO_ROUTES.insurance,
  keywords: [...CATALOG_KEYWORDS, "assurance location voiture", "caution location véhicule"],
});

export default function InsuranceInfoPage() {
  return (
    <>
      <PageHero
        eyebrow="Informations"
        title="Assurance et location de véhicule premium"
        description="Couverture, documents et caution — tout ce qu'il faut savoir avant de réserver."
      />
      <InfoArticle blocks={INSURANCE_INFO_BLOCKS} />
      <InfoCta>
        <h2 className="de-display text-xl tracking-tight">Prêt à réserver ?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed de-muted">
          Parcourez la flotte ou contactez-nous pour un devis selon vos dates.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={PUBLIC_ROUTES.vehicles} className="de-btn de-btn-primary">
            Voir les véhicules
            <ArrowRight size={16} />
          </Link>
          <Link href={PUBLIC_ROUTES.contact} className="de-btn de-btn-ghost">
            Nous contacter
          </Link>
        </div>
      </InfoCta>
    </>
  );
}
