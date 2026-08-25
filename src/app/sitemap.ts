import type { MetadataRoute } from "next";
import { fetchPublicVehicleSlugs } from "@/src/lib/public/vehicles-data";
import { INFO_ROUTES, LEGAL_ROUTES, PUBLIC_ROUTES, SITE_URL } from "@/src/lib/public/site";

export const revalidate = 3600;

function staticSitemapEntries(lastModified: Date): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}${PUBLIC_ROUTES.vehicles}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${PUBLIC_ROUTES.owners}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}${PUBLIC_ROUTES.contact}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${PUBLIC_ROUTES.calendar}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}${INFO_ROUTES.insurance}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}${INFO_ROUTES.ownerManagement}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}${LEGAL_ROUTES.legal}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}${LEGAL_ROUTES.privacy}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}${LEGAL_ROUTES.terms}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticPages = staticSitemapEntries(lastModified);

  try {
    const vehicleSlugs = await fetchPublicVehicleSlugs();
    const vehiclePages: MetadataRoute.Sitemap = vehicleSlugs.map((slug) => ({
      url: `${SITE_URL}${PUBLIC_ROUTES.vehicles}/${slug}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    }));

    return [...staticPages, ...vehiclePages];
  } catch (error) {
    console.error("[sitemap] Impossible de charger les véhicules :", error);
    return staticPages;
  }
}
