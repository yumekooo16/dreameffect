export const SITE_NAME = "DreamEffect";
export const SITE_TAGLINE = "Location et gestion de véhicules haut de gamme";

const FALLBACK_SITE_URL = "https://www.dreameffect.fr";

/** Force le canonique www + https, même si l'env pointe vers l'apex. */
export function normalizeSiteUrl(raw?: string | null): string {
  const value = raw?.trim().replace(/\/$/, "") || FALLBACK_SITE_URL;

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    url.protocol = "https:";
    if (url.hostname === "dreameffect.fr") {
      url.hostname = "www.dreameffect.fr";
    }
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const PUBLIC_ROUTES = {
  home: "/",
  vehicles: "/vehicules",
  owners: "/proprietaires",
  contact: "/contact",
  /** Calendrier public — lien Instagram / footer */
  calendar: "/calendrier",
} as const;

/** Pages éditoriales SEO (contenu informatif). */
export const INFO_ROUTES = {
  insurance: "/assurance-location-vehicule-premium",
  ownerManagement: "/gestion-locative-proprietaires",
} as const;

export const LEGAL_ROUTES = {
  privacy: "/politique-de-confidentialite",
  legal: "/mentions-legales",
  terms: "/conditions-generales-de-location",
} as const;
