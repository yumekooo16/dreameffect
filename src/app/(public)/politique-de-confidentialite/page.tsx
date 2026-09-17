import type { Metadata } from "next";
import JsonLd from "@/src/components/public/json-ld";
import PageHero from "@/src/components/public/page-hero";
import { LegalDocument } from "@/src/components/public/legal-content";
import { getPrivacyBlocks } from "@/src/lib/public/legal";
import { breadcrumbJsonLd, buildPageMetadata } from "@/src/lib/public/seo";
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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          {
            name: "Politique de confidentialité",
            path: LEGAL_ROUTES.privacy,
          },
        ])}
      />
      <PageHero
        eyebrow="Informations"
        title="Politique de confidentialité"
        description="Le traitement de vos données, et vos droits."
      />
      <LegalDocument blocks={getPrivacyBlocks()} />
    </>
  );
}
