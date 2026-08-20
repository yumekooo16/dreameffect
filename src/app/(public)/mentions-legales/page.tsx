import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import { LegalDocument } from "@/src/components/public/legal-content";
import { getLegalNoticeBlocks } from "@/src/lib/public/legal";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Mentions légales",
  description:
    "Mentions légales du site DreamEffect : éditeur, hébergeur, propriété intellectuelle et contact.",
  path: LEGAL_ROUTES.legal,
});

export default function LegalNoticePage() {
  return (
    <>
      <PageHero
        eyebrow="Informations"
        title="Mentions légales"
        description="Éditeur, hébergeur, propriété intellectuelle et contact."
      />
      <LegalDocument blocks={getLegalNoticeBlocks()} />
    </>
  );
}
