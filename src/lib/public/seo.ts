import type { Metadata } from "next";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/src/lib/public/contact";
import {
  PRIMARY_SERVICE_CITY,
  areaServedJsonLd,
  formatServiceAreaLabel,
} from "@/src/lib/public/local-seo";
import { buildSameAsLinks } from "@/src/lib/public/llms";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/src/lib/public/site";

export const DEFAULT_DESCRIPTION =
  "DreamEffect — location de véhicules haut de gamme et gestion pour propriétaires à Beauvais, Gisors et dans l'Oise. Réservation simple, véhicules entretenus.";

export const DEFAULT_OG_IMAGE = "/icons/icon-512x512.png";

type PageSeo = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
  ogImage?: string | null;
  ogType?: "website" | "article";
};

export function absoluteUrl(path = "") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteImageUrl(path?: string | null) {
  const resolved = path ? resolveVehicleImageUrl(path) : null;
  const target = resolved ?? DEFAULT_OG_IMAGE;

  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target;
  }

  return absoluteUrl(target);
}

function buildSocialImages(imageUrl: string): NonNullable<Metadata["openGraph"]>["images"] {
  return [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: SITE_NAME,
    },
  ];
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  noIndex = false,
  keywords = [],
  ogImage,
  ogType = "website",
}: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = `${title} | ${SITE_NAME}`;
  const imageUrl = absoluteImageUrl(ogImage ?? DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: ogType,
      locale: "fr_FR",
      url,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: buildSocialImages(imageUrl),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
    ...(keywords.length > 0 ? { keywords } : {}),
  };
}

export function organizationJsonLd() {
  const sameAs = buildSameAsLinks();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    areaServed: areaServedJsonLd(),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function localBusinessJsonLd() {
  const sameAs = buildSameAsLinks();
  const streetAddress = process.env.NEXT_PUBLIC_BUSINESS_STREET?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    priceRange: "€€€",
    address: {
      "@type": "PostalAddress",
      ...(streetAddress ? { streetAddress } : {}),
      addressLocality: process.env.NEXT_PUBLIC_BUSINESS_CITY ?? PRIMARY_SERVICE_CITY,
      addressRegion:
        process.env.NEXT_PUBLIC_BUSINESS_REGION ?? "Oise",
      postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE ?? "60000",
      addressCountry: "FR",
    },
    areaServed: areaServedJsonLd(),
    serviceType: [
      "Location de véhicules haut de gamme",
      "Gestion locative automobile",
      "Conciergerie automobile",
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function autoRentalJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    areaServed: areaServedJsonLd(),
    serviceType: ["Location de véhicules", "Gestion de flotte pour propriétaires"],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["Dream Effect", "Dreameffect"],
    description: SITE_TAGLINE,
    url: SITE_URL,
    inLanguage: "fr-FR",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function vehicleCatalogItemListJsonLd(
  items: { name: string; slug: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Catalogue véhicules — ${SITE_NAME}`,
    description: `Véhicules haut de gamme disponibles à la location (${formatServiceAreaLabel()}).`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(`/vehicules/${item.slug}`),
    })),
  };
}

export function vehicleJsonLd({
  name,
  brand,
  model,
  year,
  slug,
  description,
  imageUrl,
  price,
  available,
  fuel,
}: {
  name: string;
  brand: string;
  model: string;
  year?: number | null;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  available: boolean;
  fuel?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name,
    description: description ?? `Location ${name} chez ${SITE_NAME}.`,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    model,
    ...(year ? { vehicleModelDate: String(year) } : {}),
    ...(fuel ? { fuelType: fuel } : {}),
    image: imageUrl ? [absoluteImageUrl(imageUrl)] : [absoluteUrl(DEFAULT_OG_IMAGE)],
    url: absoluteUrl(`/vehicules/${slug}`),
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "EUR",
          availability: available
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price,
            priceCurrency: "EUR",
            unitText: "DAY",
          },
        }
      : undefined,
  };
}

export function globalPublicJsonLd() {
  return [organizationJsonLd(), localBusinessJsonLd(), autoRentalJsonLd(), webSiteJsonLd()];
}
