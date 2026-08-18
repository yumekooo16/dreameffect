/** SEO local — zones desservies et mots-clés de base (sans bourrage). */

export const PRIMARY_SERVICE_CITY = "Beauvais";

type ServiceCity = {
  name: string;
  schemaType: "City";
  region: string;
  department?: string;
};

type ServiceDepartment = {
  name: string;
  schemaType: "AdministrativeArea";
  region: string;
};

export const SERVICE_AREAS: readonly (ServiceCity | ServiceDepartment)[] = [
  { name: "Beauvais", schemaType: "City", region: "Oise", department: "60" },
  { name: "Gisors", schemaType: "City", region: "Eure", department: "27" },
  { name: "Oise", schemaType: "AdministrativeArea", region: "Hauts-de-France" },
  { name: "Eure", schemaType: "AdministrativeArea", region: "Normandie" },
] as const;

export const LOCAL_KEYWORDS = [
  "location véhicule Beauvais",
  "location voiture Oise",
  "location auto Gisors",
  "location véhicule Eure",
  "DreamEffect",
] as const;

export const HOME_KEYWORDS = [
  ...LOCAL_KEYWORDS,
  "location véhicule haut de gamme",
  "gestion véhicule propriétaire",
  "conciergerie automobile",
] as const;

export const CATALOG_KEYWORDS = [
  ...LOCAL_KEYWORDS,
  "catalogue véhicules luxe",
  "louer voiture sportive",
  "location berline premium",
] as const;

export const OWNERS_KEYWORDS = [
  ...LOCAL_KEYWORDS,
  "confier véhicule location",
  "gestion locative automobile",
  "rentabiliser voiture",
] as const;

export const CONTACT_KEYWORDS = [
  ...LOCAL_KEYWORDS,
  "contact location véhicule",
  "devis location auto",
] as const;

export function formatServiceAreaLabel() {
  return "Beauvais · Gisors · Oise · Eure";
}

export function resolveVehicleSeoCity(location?: string | null) {
  const value = location?.trim();
  if (!value) return PRIMARY_SERVICE_CITY;
  return value;
}

export function buildVehicleSeoTitle(
  vehicleName: string,
  location?: string | null
) {
  const city = resolveVehicleSeoCity(location);
  return `Location ${vehicleName} à ${city}`;
}

export function buildVehicleSeoDescription({
  vehicleName,
  location,
  fromPrice,
  year,
  fuel,
}: {
  vehicleName: string;
  location?: string | null;
  fromPrice?: string | null;
  year?: number | null;
  fuel?: string | null;
}) {
  const city = resolveVehicleSeoCity(location);
  const parts = [
    `Louez ${vehicleName}`,
    year ? `(${year})` : null,
    `à ${city} avec DreamEffect.`,
    fromPrice ? `Dès ${fromPrice}.` : null,
    fuel ? `Carburant : ${fuel}.` : null,
    "Réservation simple, véhicule entretenu et suivi rigoureux.",
  ].filter(Boolean);

  return parts.join(" ").slice(0, 160);
}

export function buildVehicleSeoKeywords(
  brand: string,
  model: string,
  location?: string | null
) {
  const city = resolveVehicleSeoCity(location);
  return [
    `location ${brand} ${model}`,
    `location ${brand} ${city}`,
    `louer ${brand} ${model}`,
    `location voiture ${city}`,
    "DreamEffect",
    "location véhicule Oise",
  ];
}

export function buildVehicleImageAlt({
  brand,
  model,
  version,
  year,
  location,
}: {
  brand: string;
  model: string;
  version?: string | null;
  year?: number | null;
  location?: string | null;
}) {
  const name = [brand, model, version?.trim()].filter(Boolean).join(" ");
  const city = resolveVehicleSeoCity(location);
  const yearPart = year ? ` ${year}` : "";
  return `Location ${name}${yearPart} — DreamEffect, ${city}`;
}

export function areaServedJsonLd() {
  return SERVICE_AREAS.map((area) => {
    if (area.schemaType === "City") {
      return {
        "@type": "City" as const,
        name: area.name,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: area.region,
        },
      };
    }

    return {
      "@type": "AdministrativeArea" as const,
      name: area.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: area.region,
      },
    };
  });
}
