import type { Metadata } from "next";
import { connection } from "next/server";
import OwnersHero from "@/src/components/public/owners-hero";
import OwnersContent from "@/src/components/public/owners-content";
import JsonLd from "@/src/components/public/json-ld";
import { FAQ_ITEMS } from "@/src/components/public/owners-faq";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
} from "@/src/lib/public/seo";
import { withDemoFleetFallback } from "@/src/lib/public/demo-vehicles";
import { fetchPublicVehicles } from "@/src/lib/public/vehicles-data";
import { resolveHeroVisual } from "@/src/lib/public/hero-image";
import {
  OWNERS_KEYWORDS,
  areaServedJsonLd,
  formatServiceAreaLabel,
} from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES, SITE_URL } from "@/src/lib/public/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Confier votre véhicule",
  description: `Rentabilisez votre véhicule sans vous en occuper (${formatServiceAreaLabel()}). DreamEffect gère réservations, accueil, nettoyage et suivi — vous percevez vos revenus.`,
  path: PUBLIC_ROUTES.owners,
  keywords: [...OWNERS_KEYWORDS],
});

function ownersFaqJsonLd() {
  return faqPageJsonLd(FAQ_ITEMS);
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

export default async function OwnersPage() {
  await connection();

  const vehicles = withDemoFleetFallback(await fetchPublicVehicles());
  const heroVisual = resolveHeroVisual(vehicles);

  return (
    <div className="de-owners-page">
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
      <OwnersHero
        imageUrl={heroVisual?.url}
        imageFrame={heroVisual?.frame}
        vehicles={vehicles}
      />
      <OwnersContent />
    </div>
  );
}
