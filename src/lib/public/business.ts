/** NAP (Nom / Adresse / Téléphone) — aligné sur la fiche Google Business Profile. */

function env(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export const BUSINESS_ADDRESS = {
  /** Rue complète — doit correspondre caractère pour caractère à la fiche GBP. */
  street: env("NEXT_PUBLIC_BUSINESS_STREET"),
  city: env("NEXT_PUBLIC_BUSINESS_CITY") ?? "Beauvais",
  postalCode: env("NEXT_PUBLIC_BUSINESS_POSTAL_CODE") ?? "60000",
  region: env("NEXT_PUBLIC_BUSINESS_REGION") ?? "Oise",
  countryCode: "FR" as const,
  countryLabel: "France",
};

export const GOOGLE_BUSINESS_URL = env("NEXT_PUBLIC_GOOGLE_BUSINESS_URL");

export const OPENING_HOURS = {
  opens: "09:00",
  closes: "19:00",
  days: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ] as const,
};

export const AREA_SERVED_LABELS = ["Beauvais", "Gisors", "Oise", "Eure"] as const;

export const PWA_ICON_512 = "/icons/icon-512x512.png";

/** Adresse sur une ligne (footer, contact, JSON-LD). */
export function formatBusinessAddressLine(): string {
  const { street, postalCode, city, countryLabel } = BUSINESS_ADDRESS;

  if (street) {
    return `${street}, ${postalCode} ${city}, ${countryLabel}`;
  }

  return `${postalCode} ${city}, ${countryLabel}`;
}

/** Adresse sur plusieurs lignes pour affichage bloc. */
export function formatBusinessAddressLines(): string[] {
  const { street, postalCode, city, countryLabel } = BUSINESS_ADDRESS;
  const lines: string[] = [];

  if (street) {
    lines.push(street);
  }

  lines.push(`${postalCode} ${city}`);
  lines.push(countryLabel);

  return lines;
}

export function businessPostalAddressJsonLd() {
  const { street, city, postalCode, region, countryCode } = BUSINESS_ADDRESS;

  return {
    "@type": "PostalAddress" as const,
    ...(street ? { streetAddress: street } : {}),
    addressLocality: city,
    addressRegion: region,
    postalCode,
    addressCountry: countryCode,
  };
}

export function openingHoursSpecificationJsonLd() {
  return [
    {
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: [...OPENING_HOURS.days],
      opens: OPENING_HOURS.opens,
      closes: OPENING_HOURS.closes,
    },
  ];
}

/** URL d'embed Google Maps — personnalisable ou dérivée de l'adresse. */
export function buildGoogleMapsEmbedUrl(): string | null {
  const custom = env("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL");
  if (custom) return custom;

  const { street, postalCode, city } = BUSINESS_ADDRESS;
  const query = street
    ? `${street}, ${postalCode} ${city}, France`
    : `${postalCode} ${city}, France`;

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/** Lien « itinéraire » Google Maps. */
export function buildGoogleMapsDirectionsUrl(): string {
  const custom = env("NEXT_PUBLIC_GOOGLE_MAPS_DIRECTIONS_URL");
  if (custom) return custom;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatBusinessAddressLine())}`;
}
