import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import VehicleCatalog from "@/src/components/public/vehicle-catalog";
import JsonLd from "@/src/components/public/json-ld";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  vehicleCatalogItemListJsonLd,
} from "@/src/lib/public/seo";
import { CATALOG_KEYWORDS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import {
  fetchPublicVehicles,
  getVehicleDisplayName,
} from "@/src/lib/public/vehicles-data";
import { resolveHeroImageUrl } from "@/src/lib/public/hero-image";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "La flotte",
  description: `Catalogue DreamEffect — véhicules haut de gamme à louer à ${formatServiceAreaLabel()}. Berlines, SUV et sportives entretenues, tarifs à la journée, réservation par WhatsApp.`,
  path: PUBLIC_ROUTES.vehicles,
  keywords: [...CATALOG_KEYWORDS],
});

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await fetchPublicVehicles();
  const heroImageUrl = resolveHeroImageUrl(vehicles);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "La flotte", path: PUBLIC_ROUTES.vehicles },
          ]),
          vehicleCatalogItemListJsonLd(
            vehicles.map((vehicle) => ({
              name: getVehicleDisplayName(vehicle),
              slug: vehicle.slug,
            }))
          ),
        ]}
      />
      <PageHero
        title="La flotte"
        description={`Véhicules disponibles à ${formatServiceAreaLabel()} — tarifs affichés, demande par WhatsApp ou formulaire.`}
        imageUrl={heroImageUrl}
      />
      <section className="de-section de-section-compact">
        <div className="de-public-container">
          <VehicleCatalog vehicles={vehicles} />
        </div>
      </section>
    </>
  );
}
