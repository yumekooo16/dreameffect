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
import type { PublicVehicleDetail } from "@/src/lib/public/vehicles-types";

export const metadata: Metadata = buildPageMetadata({
  title: "Calendrier des réservations",
  description: `Consultez les disponibilités de la flotte DreamEffect à ${formatServiceAreaLabel()}. Choisissez un véhicule, estimez votre location et envoyez votre demande.`,
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
  let selectedVehicle: PublicVehicleDetail | null = null;
  let availability = null;

  if (requestedSlug) {
    const published = await fetchPublicVehicleBySlug(requestedSlug);
    const fromList = vehicles.find((vehicle) => vehicle.slug === requestedSlug);

    if (published) {
      selectedSlug = published.slug;
      selectedVehicle = published;
      availability = await fetchVehicleAvailability(published.id);
    } else if (fromList) {
      // Fallback démo : pas de vrai calendrier métier
      selectedSlug = fromList.slug;
      selectedVehicle = {
        ...fromList,
        color: null,
        images: fromList.image_url
          ? [
              {
                id: `${fromList.id}-primary`,
                image_url: fromList.image_url,
                is_primary: true,
                imageFrame: fromList.imageFrame,
              },
            ]
          : [],
      };
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
        description="Choisissez un véhicule, consultez les dates libres, estimez votre location et envoyez votre demande — idéal depuis Instagram."
        imageUrl={heroImageUrl}
      />
      <section className="de-section de-section-compact">
        <div className="de-public-container">
          <ReservationCalendar
            vehicles={vehicles}
            selectedSlug={selectedSlug}
            selectedVehicle={selectedVehicle}
            availability={availability}
          />
        </div>
      </section>
    </>
  );
}
