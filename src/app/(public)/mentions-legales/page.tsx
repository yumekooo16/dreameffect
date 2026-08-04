import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import { LegalPlaceholder } from "@/src/components/public/legal-content";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site DreamEffect.",
  path: LEGAL_ROUTES.legal,
  noIndex: true,
});

export default function LegalNoticePage() {
  return (
    <>
      <PageHero
        title="Mentions légales"
        description="Informations légales relatives au site DreamEffect."
      />
      <LegalPlaceholder
        title="Publication prochaine"
        description="Les mentions légales complètes (éditeur, hébergeur, SIRET, capital social) seront publiées dès disponibilité du Kbis et des informations société."
      />
    </>
  );
}
