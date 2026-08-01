import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/public/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/espace-proprietaire/",
        "/login",
        "/redirect",
        "/offline",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
