import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import { LegalDocument } from "@/src/components/public/legal-content";
import { getPrivacyBlocks } from "@/src/lib/public/legal";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité DreamEffect — traitement des données personnelles, durées de conservation et vos droits RGPD.",
  path: LEGAL_ROUTES.privacy,
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        title="Politique de confidentialité"
        description="Comment DreamEffect traite vos données personnelles."
      />
      <LegalDocument blocks={getPrivacyBlocks()} />
    </>
  );
}
