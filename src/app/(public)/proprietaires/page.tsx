import type { Metadata } from "next";
import OwnersHero from "@/src/components/public/owners-hero";
import OwnersContent from "@/src/components/public/owners-content";
import JsonLd from "@/src/components/public/json-ld";
import { FAQ_ITEMS } from "@/src/components/public/owners-faq";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  organizationJsonLd,
} from "@/src/lib/public/seo";
import {
  OWNERS_KEYWORDS,
  areaServedJsonLd,
  formatServiceAreaLabel,
} from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES, SITE_URL } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Confier votre véhicule",
  description: `Rentabilisez votre véhicule sans vous en occuper (${formatServiceAreaLabel()}). DreamEffect gère réservations, accueil, nettoyage et suivi — vous percevez vos revenus.`,
  path: PUBLIC_ROUTES.owners,
  keywords: [...OWNERS_KEYWORDS],
});

function ownersFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function ownersServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Gestion de véhicule en location — DreamEffect",
    description:
      "Mise en location et gestion complète de véhicules haut de gamme pour propriétaires.",
    provider: organizationJsonLd(),
    areaServed: areaServedJsonLd(),
    serviceType: "Gestion locative automobile",
    url: `${SITE_URL}${PUBLIC_ROUTES.owners}`,
  };
}

export default function OwnersPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Propriétaires", path: PUBLIC_ROUTES.owners },
          ]),
          ownersFaqJsonLd(),
          ownersServiceJsonLd(),
        ]}
      />
      <OwnersHero />
      <OwnersContent />
    </>
  );
}
