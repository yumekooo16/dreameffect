import { GOOGLE_BUSINESS_URL } from "@/src/lib/public/business";
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS } from "@/src/lib/public/contact";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import {
  INFO_ROUTES,
  LEGAL_ROUTES,
  PUBLIC_ROUTES,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/src/lib/public/site";

export function buildSameAsLinks(): string[] {
  return [
    GOOGLE_BUSINESS_URL,
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.facebook,
    SOCIAL_LINKS.linkedin,
  ].filter((url): url is string => Boolean(url?.trim()));
}

export function buildLlmsTxt(): string {
  const sameAs = buildSameAsLinks();
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_TAGLINE} — ${formatServiceAreaLabel()}.`,
    "",
    "## Pages principales",
    "",
    `- Accueil : ${SITE_URL}/`,
    `- Catalogue véhicules : ${SITE_URL}${PUBLIC_ROUTES.vehicles}`,
    `- Propriétaires : ${SITE_URL}${PUBLIC_ROUTES.owners}`,
    `- Contact : ${SITE_URL}${PUBLIC_ROUTES.contact}`,
    `- Assurance location premium : ${SITE_URL}${INFO_ROUTES.insurance}`,
    `- Gestion locative propriétaires : ${SITE_URL}${INFO_ROUTES.ownerManagement}`,
    `- Conditions de location : ${SITE_URL}${LEGAL_ROUTES.terms}`,
    "",
    "## Contact",
    "",
    `- Téléphone : ${CONTACT_PHONE}`,
    `- Email : ${CONTACT_EMAIL}`,
    `- Site : ${SITE_URL}`,
  ];

  if (sameAs.length > 0) {
    lines.push("", "## Profils officiels", "");
    for (const url of sameAs) {
      lines.push(`- ${url}`);
    }
  }

  lines.push(
    "",
    "## Indexation",
    "",
    `- Sitemap : ${SITE_URL}/sitemap.xml`,
    `- Robots : ${SITE_URL}/robots.txt`,
    "",
    "Ce site est public. Les espaces /login, /admin et /espace-proprietaire sont réservés aux utilisateurs authentifiés."
  );

  return `${lines.join("\n")}\n`;
}
