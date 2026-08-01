import type { MetadataRoute } from "next";
import { fetchPublicVehicleSlugs } from "@/src/lib/public/vehicles-data";
import { PUBLIC_ROUTES, SITE_URL } from "@/src/lib/public/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const vehicleSlugs = await fetchPublicVehicleSlugs();

  const staticPages: MetadataRoute.Sitemap = [
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
  ];

  const vehiclePages: MetadataRoute.Sitemap = vehicleSlugs.map((slug) => ({
    url: `${SITE_URL}${PUBLIC_ROUTES.vehicles}/${slug}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  return [...staticPages, ...vehiclePages];
}
