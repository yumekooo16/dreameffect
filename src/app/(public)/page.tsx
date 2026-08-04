import type { Metadata } from "next";
import HeroSection from "@/src/components/public/hero";
import HowItWorksSection from "@/src/components/public/how-it-works";
import VehiclesPreview from "@/src/components/public/vehicles-preview";
import HomeCtaSection from "@/src/components/public/home-cta";
import { fetchPublicVehicles } from "@/src/lib/public/vehicles-data";
import { HOME_KEYWORDS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { buildPageMetadata } from "@/src/lib/public/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "DreamEffect — Location véhicules haut de gamme",
  description: `Location et gestion de véhicules haut de gamme avec DreamEffect (${formatServiceAreaLabel()}). Réservation simple, flotte entretenue, accompagnement premium.`,
  path: "/",
  keywords: [...HOME_KEYWORDS],
});

export default async function HomePage() {
  const vehicles = await fetchPublicVehicles();

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <VehiclesPreview vehicles={vehicles} />
      <HomeCtaSection />
    </>
  );
}
