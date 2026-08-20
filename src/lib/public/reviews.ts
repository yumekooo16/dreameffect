/** Avis clients — alignés sur la fiche Google Business Profile (configurables via env). */

import { GOOGLE_BUSINESS_URL } from "@/src/lib/public/business";

export type CustomerReview = {
  author: string;
  rating: number;
  text: string;
  date?: string;
};

function parseReviewsJson(raw: string | undefined): CustomerReview[] | null {
  if (!raw?.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    return parsed.filter(
      (item): item is CustomerReview =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CustomerReview).author === "string" &&
        typeof (item as CustomerReview).text === "string" &&
        typeof (item as CustomerReview).rating === "number"
    );
  } catch {
    return null;
  }
}

const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    author: "Client locataire",
    rating: 5,
    text: "Véhicule impeccable, remise des clés simple et réactive. Communication claire du début à la fin.",
  },
  {
    author: "Propriétaire",
    rating: 5,
    text: "Gestion locative sérieuse : réservations, entretien et suivi sans que j'aie à m'en occuper.",
  },
  {
    author: "Client locataire",
    rating: 5,
    text: "Réponse rapide par WhatsApp, tarifs transparents et véhicule conforme à l'annonce.",
  },
];

export function getCustomerReviews(): CustomerReview[] {
  const fromEnv = parseReviewsJson(process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_JSON);
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_REVIEWS;
}

export function getGoogleReviewsUrl(): string | null {
  return GOOGLE_BUSINESS_URL;
}
