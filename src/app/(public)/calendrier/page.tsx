import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import JsonLd from "@/src/components/public/json-ld";
import ReservationCalendar from "@/src/components/public/reservation-calendar";
import { fetchVehicleAvailability } from "@/src/lib/public/availability-data";
import { withDemoFleetFallback } from "@/src/lib/public/demo-vehicles";
import { resolveHeroImageUrl } from "@/src/lib/public/hero-image";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { breadcrumbJsonLd, buildPageMetadata } from "@/src/lib/public/seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import {
  fetchPublicVehicleBySlug,
  fetchPublicVehicles,
} from "@/src/lib/public/vehicles-data";

export const metadata: Metadata = buildPageMetadata({
  title: "Calendrier des réservations",
  description: `Consultez les disponibilités de la flotte DreamEffect à ${formatServiceAreaLabel()}. Choisissez un véhicule et voyez les dates déjà réservées.`,
  path: PUBLIC_ROUTES.calendar,
  keywords: [
    "calendrier réservation voiture",
    "disponibilités location véhicule",
    "DreamEffect calendrier",
    "location Beauvais Gisors",
  ],
});

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ vehicule?: string }>;
};

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedSlug = params.vehicule?.trim() || null;

  const fetched = await fetchPublicVehicles();
  const vehicles = withDemoFleetFallback(fetched);
  const heroImageUrl = resolveHeroImageUrl(vehicles);

  let selectedSlug: string | null = null;
  let availability = null;

  if (requestedSlug) {
    const published = await fetchPublicVehicleBySlug(requestedSlug);
    const fromList = vehicles.find((vehicle) => vehicle.slug === requestedSlug);

    if (published) {
      selectedSlug = published.slug;
      availability = await fetchVehicleAvailability(published.id);
    } else if (fromList) {
      // Fallback démo : pas de vrai calendrier métier
      selectedSlug = fromList.slug;
      availability = { blockedPeriods: [], maintenanceDays: [] };
    }
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          {
            name: "Calendrier des réservations",
            path: PUBLIC_ROUTES.calendar,
          },
        ])}
      />
      <PageHero
        title="Calendrier des réservations"
        description="Choisissez un véhicule de la flotte, puis consultez les dates déjà réservées. Lien pratique pour Instagram et le partage rapide."
        imageUrl={heroImageUrl}
      />
      <section className="de-section de-section-compact">
        <div className="de-public-container">
          <ReservationCalendar
            vehicles={vehicles}
            selectedSlug={selectedSlug}
            availability={availability}
          />
        </div>
      </section>
    </>
  );
}
