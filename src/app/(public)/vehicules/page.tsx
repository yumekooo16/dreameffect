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
import { withDemoFleetFallback } from "@/src/lib/public/demo-vehicles";
import {
  fetchPublicVehicles,
  getVehicleDisplayName,
} from "@/src/lib/public/vehicles-data";
import { resolveHeroImageUrl } from "@/src/lib/public/hero-image";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Nos véhicules",
  description: `Catalogue DreamEffect — véhicules haut de gamme à louer à ${formatServiceAreaLabel()}. Berlines, SUV et sportives entretenues, tarifs à la journée, réservation WhatsApp.`,
  path: PUBLIC_ROUTES.vehicles,
  keywords: [...CATALOG_KEYWORDS],
});

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const fetched = await fetchPublicVehicles();
  const vehicles = withDemoFleetFallback(fetched);
  const heroImageUrl = resolveHeroImageUrl(vehicles);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Nos véhicules", path: PUBLIC_ROUTES.vehicles },
          ]),
          vehicleCatalogItemListJsonLd(
            fetched.map((vehicle) => ({
              name: getVehicleDisplayName(vehicle),
              slug: vehicle.slug,
            }))
          ),
        ]}
      />
      <PageHero
        title="Nos véhicules"
        description={`Flotte disponible à ${formatServiceAreaLabel()} — tarifs affichés, réservation par WhatsApp ou formulaire.`}
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
