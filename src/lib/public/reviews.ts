/** Avis clients — uniquement depuis la config (pas de faux avis par défaut). */

import { GOOGLE_REVIEWS_URL } from "@/src/lib/public/business";

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

export function getCustomerReviews(): CustomerReview[] {
  const fromEnv = parseReviewsJson(process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_JSON);
  return fromEnv ?? [];
}

export function getGoogleReviewsUrl(): string {
  return GOOGLE_REVIEWS_URL;
}
