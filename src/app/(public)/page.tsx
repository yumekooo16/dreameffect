import type { Metadata } from "next";
import { connection } from "next/server";
import HeroSection from "@/src/components/public/hero";
import HomeCitiesSection from "@/src/components/public/home-cities";
import HowItWorksSection from "@/src/components/public/how-it-works";
import VehiclesPreview from "@/src/components/public/vehicles-preview";
import HomeReviewsSection from "@/src/components/public/home-reviews";
import HomeCtaSection from "@/src/components/public/home-cta";
import HomeFaqSection, { HOME_FAQ_ITEMS } from "@/src/components/public/home-faq";
import HomeFigures from "@/src/components/public/home-figures";
import JsonLd from "@/src/components/public/json-ld";
import { withDemoFleetFallback } from "@/src/lib/public/demo-vehicles";
import { fetchPublicVehicles } from "@/src/lib/public/vehicles-data";
import { HOME_KEYWORDS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { buildPageMetadata, faqPageJsonLd } from "@/src/lib/public/seo";
import {
  collectNarrativeVisualPool,
  resolveHeroVisual,
} from "@/src/lib/public/hero-image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "DreamEffect — Location & conciergerie Beauvais · Gisors",
  description: `Agence de location et conciergerie automobile à Beauvais et Gisors (${formatServiceAreaLabel()}). Flotte haut de gamme, tarifs affichés, réservation WhatsApp. Gestion locative pour propriétaires.`,
  path: "/",
  keywords: [...HOME_KEYWORDS],
  absoluteTitle: true,
});

export default async function HomePage() {
  await connection();

  const vehicles = withDemoFleetFallback(await fetchPublicVehicles());
  const heroVisual = resolveHeroVisual(vehicles);
  const visualPool = await collectNarrativeVisualPool(vehicles);

  return (
    <>
      <JsonLd data={faqPageJsonLd([...HOME_FAQ_ITEMS])} />
      <HeroSection imageUrl={heroVisual?.url} imageFrame={heroVisual?.frame} />
      <HomeCitiesSection />
      <HomeFigures />
      <VehiclesPreview vehicles={vehicles} />
      <HowItWorksSection
        visualPool={visualPool}
        excludeUrl={heroVisual?.url}
      />
      <HomeReviewsSection />
      <HomeFaqSection />
      <HomeCtaSection />
    </>
  );
}
