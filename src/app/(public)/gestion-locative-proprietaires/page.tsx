import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InfoArticle, InfoCta } from "@/src/components/public/info-article";
import PageHero from "@/src/components/public/page-hero";
import { OWNER_MANAGEMENT_INFO_BLOCKS } from "@/src/lib/public/info-content";
import { OWNERS_KEYWORDS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { INFO_ROUTES, PUBLIC_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Gestion locative pour propriétaires de véhicules",
  description: `Confiez votre véhicule haut de gamme à DreamEffect (${formatServiceAreaLabel()}). Réservations, remises de clés, entretien et suivi — vous percevez vos revenus.`,
  path: INFO_ROUTES.ownerManagement,
  keywords: [...OWNERS_KEYWORDS, "gestion locative voiture", "rentabiliser véhicule"],
});

export default function OwnerManagementInfoPage() {
  return (
    <>
      <PageHero
        eyebrow="Propriétaires"
        title="Comment fonctionne la gestion locative"
        description="De la mise en ligne au versement de vos revenus — le parcours propriétaire avec DreamEffect."
      />
      <InfoArticle blocks={OWNER_MANAGEMENT_INFO_BLOCKS} />
      <InfoCta>
        <h2 className="de-display text-xl tracking-tight">Confiez votre véhicule</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed de-muted">
          Décrivez votre modèle : nous revenons vers vous avec les étapes de mise en
          gestion.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={PUBLIC_ROUTES.owners} className="de-btn de-btn-primary">
            Espace propriétaires
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
