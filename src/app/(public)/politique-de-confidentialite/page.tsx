import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import { LegalPlaceholder } from "@/src/components/public/legal-content";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité DreamEffect — traitement des données personnelles et vos droits RGPD.",
  path: LEGAL_ROUTES.privacy,
  noIndex: true,
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        title="Politique de confidentialité"
        description="Comment DreamEffect traite vos données personnelles."
      />
      <LegalPlaceholder
        title="Publication prochaine"
        description="Ce document sera publié dès réception des informations légales de l'entreprise (Kbis, adresse du siège, responsable de traitement). Il détaillera les finalités, bases légales, durées de conservation et vos droits (accès, rectification, suppression, opposition, portabilité)."
      />
    </>
  );
}
