import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VehicleDetailContent from "@/src/components/public/vehicle-detail-content";
import JsonLd from "@/src/components/public/json-ld";
import { getFuelLabel } from "@/src/lib/vehicles/catalog-fields";
import {
  fetchPublicVehicleBySlug,
  fetchPublicVehicleSlugs,
  getVehicleDisplayName,
} from "@/src/lib/public/vehicles-data";
import { fetchVehicleAvailability } from "@/src/lib/public/availability-data";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  vehicleJsonLd,
} from "@/src/lib/public/seo";
import {
  buildVehicleSeoDescription,
  buildVehicleSeoKeywords,
  buildVehicleSeoTitle,
} from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import { getLowestRentalPrice, formatPrice } from "@/src/lib/vehicles/pricing";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await fetchPublicVehicleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await fetchPublicVehicleBySlug(slug);

  if (!vehicle) {
    return buildPageMetadata({
      title: "Véhicule introuvable",
      path: `${PUBLIC_ROUTES.vehicles}/${slug}`,
      noIndex: true,
    });
  }

  const name = getVehicleDisplayName(vehicle);
  const fromPrice = formatPrice(getLowestRentalPrice(vehicle.pricing));
  const title = buildVehicleSeoTitle(name, vehicle.location);
  const description =
    vehicle.description?.trim().slice(0, 160) ||
    buildVehicleSeoDescription({
      vehicleName: name,
      location: vehicle.location,
      fromPrice,
      year: vehicle.year,
      fuel: getFuelLabel(vehicle.fuel) ?? undefined,
    });

  return buildPageMetadata({
    title,
    description,
    path: `${PUBLIC_ROUTES.vehicles}/${vehicle.slug}`,
    keywords: buildVehicleSeoKeywords(vehicle.brand, vehicle.model, vehicle.location),
    ogImage: vehicle.image_url,
    ogType: "article",
  });
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await fetchPublicVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  const availability = await fetchVehicleAvailability(vehicle.id);
  const name = getVehicleDisplayName(vehicle);
  const lowestPrice = getLowestRentalPrice(vehicle.pricing);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Nos véhicules", path: PUBLIC_ROUTES.vehicles },
            {
              name,
              path: `${PUBLIC_ROUTES.vehicles}/${vehicle.slug}`,
            },
          ]),
          vehicleJsonLd({
            name,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            slug: vehicle.slug,
            description: vehicle.description,
            imageUrl: vehicle.image_url,
            price: lowestPrice,
            available: vehicle.status === "available",
            fuel: getFuelLabel(vehicle.fuel) ?? undefined,
          }),
        ]}
      />
      <VehicleDetailContent vehicle={vehicle} availability={availability} />
    </>
  );
}
