import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import { LegalDocument } from "@/src/components/public/legal-content";
import { getRentalTermsBlocks } from "@/src/lib/public/legal";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Conditions générales de location",
  description:
    "CGV location DreamEffect : caution, assurance, âge minimum, permis, kilométrage et modalités de réservation.",
  path: LEGAL_ROUTES.terms,
});

export default function RentalTermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Location"
        title="Conditions générales de location"
        description="Caution, assurance, âge, permis, kilométrage et réservation."
        compact
      />
      <LegalDocument blocks={getRentalTermsBlocks()} />
    </>
  );
}
