import {
  getLowestRentalPrice,
  formatPrice,
  type VehiclePricing,
} from "@/src/lib/vehicles/pricing";
import { startOfDay } from "@/src/lib/dates/calendar-utils";

export type BookingEstimate = {
  total: number;
  label: string;
  /** Tarif unitaire utilisé pour expliquer le calcul (si pertinent). */
  unitRate: number | null;
  unitLabel: string | null;
};

/** Tarif journalier de référence (semaine, sinon plus bas disponible). */
export function getInformativeDailyRate(pricing: VehiclePricing) {
  return pricing.price_24h_weekday ?? getLowestRentalPrice(pricing);
}

function isWeekendDay(date: Date) {
  const day = startOfDay(date).getDay();
  // Ven = 5, Sam = 6, Dim = 0
  return day === 0 || day === 5 || day === 6;
}

function rangeTouchesWeekend(start: Date, end: Date) {
  const current = startOfDay(start);
  const last = startOfDay(end);
  while (current <= last) {
    if (isWeekendDay(current)) return true;
    current.setDate(current.getDate() + 1);
  }
  return false;
}

/**
 * Estimation indicative selon les paliers déjà saisis en admin.
 * Pas de km illimité — uniquement durée + grille DreamEffect.
 */
export function estimateBooking(
  pricing: VehiclePricing,
  startDate: Date,
  endDate: Date,
  durationDays: number
): BookingEstimate | null {
  if (durationDays <= 0) return null;

  const weekendTouch = rangeTouchesWeekend(startDate, endDate);

  if (durationDays === 7 && pricing.price_7_days != null) {
    return {
      total: pricing.price_7_days,
      label: "Forfait 7 jours",
      unitRate: pricing.price_7_days,
      unitLabel: "semaine",
    };
  }

  if (durationDays === 3 && weekendTouch && pricing.price_72h_weekend != null) {
    return {
      total: pricing.price_72h_weekend,
      label: "Forfait 72 h week-end",
      unitRate: pricing.price_72h_weekend,
      unitLabel: "72 h week-end",
    };
  }

  if (durationDays === 2 && weekendTouch && pricing.price_48h_weekend != null) {
    return {
      total: pricing.price_48h_weekend,
      label: "Forfait 48 h week-end",
      unitRate: pricing.price_48h_weekend,
      unitLabel: "48 h week-end",
    };
  }

  if (durationDays === 1) {
    if (weekendTouch && pricing.price_24h_weekend != null) {
      return {
        total: pricing.price_24h_weekend,
        label: "Tarif 24 h week-end",
        unitRate: pricing.price_24h_weekend,
        unitLabel: "24 h week-end",
      };
    }
    if (pricing.price_24h_weekday != null) {
      return {
        total: pricing.price_24h_weekday,
        label: "Tarif 24 h semaine",
        unitRate: pricing.price_24h_weekday,
        unitLabel: "24 h semaine",
      };
    }
  }

  // Semaines multiples : forfait 7 j × semaines + reste au journalier
  if (durationDays > 7 && pricing.price_7_days != null) {
    const weeks = Math.floor(durationDays / 7);
    const remainder = durationDays % 7;
    const daily =
      (weekendTouch
        ? pricing.price_24h_weekend
        : pricing.price_24h_weekday) ?? getInformativeDailyRate(pricing);

    if (daily == null && remainder > 0) return null;

    const total =
      weeks * pricing.price_7_days + (remainder > 0 ? remainder * (daily ?? 0) : 0);

    return {
      total,
      label:
        remainder > 0
          ? `${weeks} × 7 jours + ${remainder} j`
          : `Forfait ${weeks} × 7 jours`,
      unitRate: pricing.price_7_days,
      unitLabel: "semaine",
    };
  }

  const daily =
    (weekendTouch ? pricing.price_24h_weekend : null) ??
    pricing.price_24h_weekday ??
    getInformativeDailyRate(pricing);

  if (daily == null) return null;

  return {
    total: daily * durationDays,
    label: weekendTouch ? "Estimation (tarif week-end)" : "Estimation (tarif semaine)",
    unitRate: daily,
    unitLabel: "jour",
  };
}

/** @deprecated Préférer estimateBooking — conservé pour compatibilité. */
export function estimateRentalTotal(
  pricing: VehiclePricing,
  durationDays: number
) {
  const dailyRate = getInformativeDailyRate(pricing);
  if (dailyRate == null || durationDays <= 0) return null;
  return dailyRate * durationDays;
}

export function formatEstimate(value: number | null) {
  if (value == null || value <= 0) return null;
  return formatPrice(value);
}
