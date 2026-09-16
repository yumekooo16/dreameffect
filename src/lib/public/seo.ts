import type { Metadata } from "next";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import {
  AREA_SERVED_LABELS,
  BUSINESS_GEO,
  PWA_ICON_512,
  businessGeoJsonLd,
  businessPostalAddressJsonLd,
  buildGoogleMapsDirectionsUrl,
  openingHoursSpecificationJsonLd,
} from "@/src/lib/public/business";
import { CONTACT_EMAIL, CONTACT_PHONE_E164 } from "@/src/lib/public/contact";
import {
  areaServedJsonLd,
  formatServiceAreaLabel,
} from "@/src/lib/public/local-seo";
import { buildSameAsLinks } from "@/src/lib/public/llms";
import { getCustomerReviews } from "@/src/lib/public/reviews";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/src/lib/public/site";

export const DEFAULT_DESCRIPTION = `DreamEffect — location et conciergerie automobile à Beauvais, Gisors et en Île-de-France (${formatServiceAreaLabel()}). Véhicules haut de gamme, gestion locative pour propriétaires, réservation WhatsApp.`;

/** Image sociale 1200×630 — distincte de l'icône PWA 512. */
export const DEFAULT_OG_IMAGE = "/og.png";
export const ORGANIZATION_LOGO = "/logo.png";

type PageSeo = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
  ogImage?: string | null;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  /** Titre document complet, sans suffixe « | DreamEffect ». */
  absoluteTitle?: boolean;
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

function buildSocialImages(
  imageUrl: string,
  alt: string
): NonNullable<Metadata["openGraph"]>["images"] {
  return [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt,
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
  ogImageAlt,
  ogType = "website",
  absoluteTitle = false,
}: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const socialTitle =
    absoluteTitle || title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const imageUrl = absoluteImageUrl(ogImage ?? DEFAULT_OG_IMAGE);
  const imageAlt = ogImageAlt?.trim() || socialTitle;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: "fr_FR",
      url,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: buildSocialImages(imageUrl, imageAlt),
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
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(ORGANIZATION_LOGO),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE_E164,
    areaServed: areaServedJsonLd(),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function faqPageJsonLd(
  items: readonly { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function aggregateRatingJsonLd() {
  const reviews = getCustomerReviews();
  if (reviews.length === 0) return null;

  const ratingValues = reviews.map((review) => review.rating).filter(Number.isFinite);
  if (ratingValues.length === 0) return null;

  const ratingValue =
    Math.round(
      (ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length) * 10
    ) / 10;

  return {
    "@type": "AggregateRating" as const,
    ratingValue,
    reviewCount: ratingValues.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function localBusinessJsonLd() {
  const sameAs = buildSameAsLinks();
  const geo = businessGeoJsonLd();
  const aggregateRating = aggregateRatingJsonLd();
  const hasMap = buildGoogleMapsDirectionsUrl();

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutomotiveBusiness"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    image: absoluteUrl(PWA_ICON_512),
    logo: absoluteUrl(ORGANIZATION_LOGO),
    telephone: CONTACT_PHONE_E164,
    email: CONTACT_EMAIL,
    priceRange: "€€€",
    address: businessPostalAddressJsonLd(),
    ...(geo ? { geo } : {}),
    ...(hasMap ? { hasMap } : {}),
    ...(Number.isFinite(BUSINESS_GEO.latitude)
      ? {
          latitude: BUSINESS_GEO.latitude,
          longitude: BUSINESS_GEO.longitude,
        }
      : {}),
    areaServed: areaServedJsonLd(),
    openingHoursSpecification: openingHoursSpecificationJsonLd(),
    ...(aggregateRating ? { aggregateRating } : {}),
    serviceType: [
      "Location de véhicules haut de gamme",
      "Gestion locative automobile",
      "Conciergerie automobile",
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function autoRentalJsonLd() {
  const sameAs = buildSameAsLinks();
  const geo = businessGeoJsonLd();

  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#autorental`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    image: absoluteUrl(PWA_ICON_512),
    url: SITE_URL,
    telephone: CONTACT_PHONE_E164,
    priceRange: "€€€",
    address: businessPostalAddressJsonLd(),
    ...(geo ? { geo } : {}),
    areaServed: [...AREA_SERVED_LABELS],
    openingHoursSpecification: openingHoursSpecificationJsonLd(),
    serviceType: ["Location de véhicules", "Gestion de flotte pour propriétaires"],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ["Dream Effect", "Dreameffect"],
    description: SITE_TAGLINE,
    url: SITE_URL,
    inLanguage: "fr-FR",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
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

export function serviceJsonLd({
  name,
  description,
  path,
  serviceType,
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    url: absoluteUrl(path),
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    areaServed: areaServedJsonLd(),
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
