import type { Metadata } from "next";
import HeroSection from "@/src/components/public/hero";
import HomeCitiesSection from "@/src/components/public/home-cities";
import HomeServicesSection from "@/src/components/public/home-services";
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
import { pickNarrativeVisuals, resolveHeroImageUrl } from "@/src/lib/public/hero-image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "DreamEffect — Location véhicules haut de gamme",
  description: `Location et gestion de véhicules haut de gamme à ${formatServiceAreaLabel()}. Flotte entretenue, tarifs affichés, réservation par WhatsApp. Gestion locative pour propriétaires.`,
  path: "/",
  keywords: [...HOME_KEYWORDS],
  absoluteTitle: true,
});

export default async function HomePage() {
  const vehicles = withDemoFleetFallback(await fetchPublicVehicles());
  const heroImageUrl = resolveHeroImageUrl(vehicles);
  const narrativeVisuals = pickNarrativeVisuals(vehicles);

  return (
    <>
      <JsonLd data={faqPageJsonLd([...HOME_FAQ_ITEMS])} />
      <HeroSection imageUrl={heroImageUrl} />
      <HomeCitiesSection />
      <HomeServicesSection />
      <HomeFigures />
      <VehiclesPreview vehicles={vehicles} />
      <HowItWorksSection visualUrls={narrativeVisuals} />
      <HomeReviewsSection />
      <HomeFaqSection />
      <HomeCtaSection />
    </>
  );
}
