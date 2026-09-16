import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/public/site";

const DISALLOW = [
  "/admin/",
  "/espace-proprietaire/",
  "/auth/",
  "/login",
  "/redirect",
  "/offline",
  "/api/",
  "/dossier/",
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

const AI_ALLOW = [
  "/",
  "/vehicules",
  "/vehicules/",
  "/contact",
  "/proprietaires",
  "/calendrier",
  "/faq",
  "/assurance-location-vehicule-premium",
  "/gestion-locative-proprietaires",
  "/agence-location-vehicule-beauvais",
  "/agence-location-vehicule-gisors",
  "/conciergerie-automobile-beauvais",
  "/conciergerie-automobile-gisors",
  "/location-vehicule-ile-de-france",
  "/location-vehicule-aeroport-beauvais-tille",
  "/llms.txt",
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
        allow: [...AI_ALLOW],
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL.replace(/^https:\/\//, ""),
  };
}
