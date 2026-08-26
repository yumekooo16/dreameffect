import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/public/site";

const DISALLOW = [
  "/admin/",
  "/espace-proprietaire/",
  "/login",
  "/redirect",
  "/offline",
  "/api/",
];

/** Crawlers IA — accès au site vitrine public (ChatGPT, Perplexity, etc.). */
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: [
          "/",
          "/vehicules",
          "/vehicules/",
          "/contact",
          "/proprietaires",
          "/calendrier",
          "/agence-location-vehicule-beauvais",
          "/agence-location-vehicule-gisors",
          "/conciergerie-automobile-beauvais",
          "/conciergerie-automobile-gisors",
          "/llms.txt",
        ],
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL.replace(/^https:\/\//, ""),
  };
}
