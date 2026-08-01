export const SITE_NAME = "DreamEffect";
export const SITE_TAGLINE = "Location et gestion de véhicules haut de gamme";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://dreameffect.fr";

export const PUBLIC_ROUTES = {
  home: "/",
  vehicles: "/vehicules",
  owners: "/proprietaires",
  contact: "/contact",
} as const;
