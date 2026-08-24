/** Grille « prix pro » — reversement propriétaire (hors catalogue public). */

export type VehicleProPricing = {
  pro_price_24h_weekday: number | null;
  pro_price_24h_weekend: number | null;
  pro_price_48h_weekend: number | null;
  pro_price_72h_weekend: number | null;
  pro_price_7_days: number | null;
  pro_included_km: number | null;
  pro_extra_km_rate: number | null;
};

export const DEFAULT_PRO_INCLUDED_KM = 200;
export const DEFAULT_PRO_EXTRA_KM_RATE = 1;

export const EMPTY_VEHICLE_PRO_PRICING: VehicleProPricing = {
  pro_price_24h_weekday: null,
  pro_price_24h_weekend: null,
  pro_price_48h_weekend: null,
  pro_price_72h_weekend: null,
  pro_price_7_days: null,
  pro_included_km: DEFAULT_PRO_INCLUDED_KM,
  pro_extra_km_rate: DEFAULT_PRO_EXTRA_KM_RATE,
};

export const PRO_PRICING_TIER_FIELDS = [
  {
    key: "pro_price_24h_weekday" as const,
    label: "24 h — semaine (prix pro)",
    shortLabel: "24 h semaine",
    hint: "Reversement propriétaire en semaine",
  },
  {
    key: "pro_price_24h_weekend" as const,
    label: "24 h — week-end (prix pro)",
    shortLabel: "24 h week-end",
    hint: "Vendredi → dimanche",
  },
  {
    key: "pro_price_48h_weekend" as const,
    label: "48 h — week-end (prix pro)",
    shortLabel: "48 h week-end",
    hint: "Week-end complet",
  },
  {
    key: "pro_price_72h_weekend" as const,
    label: "72 h — week-end (prix pro)",
    shortLabel: "72 h week-end",
    hint: "Week-end prolongé",
  },
  {
    key: "pro_price_7_days" as const,
    label: "Semaine complète (prix pro)",
    shortLabel: "7 jours",
    hint: "Forfait hebdomadaire propriétaire",
  },
] as const;

export type ProPricingTierKey =
  (typeof PRO_PRICING_TIER_FIELDS)[number]["key"];

function parsePositive(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function parseNonNegativeInt(value: unknown, fallback: number): number {
  if (value == null || value === "") return fallback;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return Math.round(num);
}

function parseNonNegativeRate(value: unknown, fallback: number): number {
  if (value == null || value === "") return fallback;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return num;
}

export function normalizeVehicleProPricing(
  input: Partial<VehicleProPricing> | null | undefined
): VehicleProPricing {
  return {
    pro_price_24h_weekday: parsePositive(input?.pro_price_24h_weekday),
    pro_price_24h_weekend: parsePositive(input?.pro_price_24h_weekend),
    pro_price_48h_weekend: parsePositive(input?.pro_price_48h_weekend),
    pro_price_72h_weekend: parsePositive(input?.pro_price_72h_weekend),
    pro_price_7_days: parsePositive(input?.pro_price_7_days),
    pro_included_km: parseNonNegativeInt(
      input?.pro_included_km,
      DEFAULT_PRO_INCLUDED_KM
    ),
    pro_extra_km_rate: parseNonNegativeRate(
      input?.pro_extra_km_rate,
      DEFAULT_PRO_EXTRA_KM_RATE
    ),
  };
}

export function hasAnyProPrice(pricing: VehicleProPricing): boolean {
  return (
    pricing.pro_price_24h_weekday != null ||
    pricing.pro_price_24h_weekend != null ||
    pricing.pro_price_48h_weekend != null ||
    pricing.pro_price_72h_weekend != null ||
    pricing.pro_price_7_days != null
  );
}

function startOfLocalDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

/** Jours calendaires inclusifs (aligné sur le ledger). */
export function countInclusiveDays(startDate: string, endDate: string) {
  const start = startOfLocalDay(new Date(startDate));
  const end = startOfLocalDay(new Date(endDate));
  const days =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(days, 1);
}

/** true si le jour (local) est ven / sam / dim. */
export function isWeekendDay(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 5 || day === 6;
}

/** Location « week-end » si ≥ 50 % des jours tombent ven–dim. */
export function isWeekendDominantRental(startDate: string, endDate: string) {
  const start = startOfLocalDay(new Date(startDate));
  const days = countInclusiveDays(startDate, endDate);
  let weekendDays = 0;

  for (let i = 0; i < days; i += 1) {
    const cursor = new Date(start);
    cursor.setDate(start.getDate() + i);
    if (isWeekendDay(cursor)) weekendDays += 1;
  }

  return weekendDays >= Math.ceil(days / 2);
}

export type ProTierMatch = {
  key: ProPricingTierKey | "weekday_daily_fallback";
  label: string;
  baseAmount: number;
};

function pickTier(
  pricing: VehicleProPricing,
  days: number,
  weekendDominant: boolean
): ProTierMatch | null {
  if (days >= 7 && pricing.pro_price_7_days != null) {
    const weeks = Math.floor(days / 7);
    const remainder = days % 7;
    let amount = weeks * pricing.pro_price_7_days;

    if (remainder > 0) {
      const daily =
        pricing.pro_price_24h_weekday ??
        Math.round((pricing.pro_price_7_days / 7) * 100) / 100;
      amount += remainder * daily;
    }

    return {
      key: "pro_price_7_days",
      label: weeks > 1 ? `${weeks} × semaine + ${remainder} j` : "Semaine complète",
      baseAmount: Math.round(amount * 100) / 100,
    };
  }

  if (weekendDominant) {
    if (days === 1 && pricing.pro_price_24h_weekend != null) {
      return {
        key: "pro_price_24h_weekend",
        label: "24 h week-end",
        baseAmount: pricing.pro_price_24h_weekend,
      };
    }
    if (days === 2 && pricing.pro_price_48h_weekend != null) {
      return {
        key: "pro_price_48h_weekend",
        label: "48 h week-end",
        baseAmount: pricing.pro_price_48h_weekend,
      };
    }
    if (days === 3 && pricing.pro_price_72h_weekend != null) {
      return {
        key: "pro_price_72h_weekend",
        label: "72 h week-end",
        baseAmount: pricing.pro_price_72h_weekend,
      };
    }
    // 4–6 jours week-end : 72h + jours restants au tarif 24h week-end / semaine
    if (days > 3 && days < 7) {
      const base72 = pricing.pro_price_72h_weekend;
      const dayRate =
        pricing.pro_price_24h_weekend ?? pricing.pro_price_24h_weekday;
      if (base72 != null && dayRate != null) {
        return {
          key: "pro_price_72h_weekend",
          label: `72 h week-end + ${days - 3} j`,
          baseAmount: Math.round((base72 + (days - 3) * dayRate) * 100) / 100,
        };
      }
    }
  }

  if (days === 1 && pricing.pro_price_24h_weekday != null) {
    return {
      key: "pro_price_24h_weekday",
      label: "24 h semaine",
      baseAmount: pricing.pro_price_24h_weekday,
    };
  }

  if (pricing.pro_price_24h_weekday != null) {
    return {
      key: "weekday_daily_fallback",
      label: `${days} × 24 h semaine`,
      baseAmount:
        Math.round(pricing.pro_price_24h_weekday * days * 100) / 100,
    };
  }

  // Derniers recours sur les autres paliers renseignés
  if (pricing.pro_price_7_days != null) {
    const daily = Math.round((pricing.pro_price_7_days / 7) * 100) / 100;
    return {
      key: "pro_price_7_days",
      label: `${days} j (prorata semaine)`,
      baseAmount: Math.round(daily * days * 100) / 100,
    };
  }

  return null;
}

export function computeExtraKmAmount(
  pricing: VehicleProPricing,
  distanceKm: number | null | undefined
) {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return 0;
  }

  const included = pricing.pro_included_km ?? DEFAULT_PRO_INCLUDED_KM;
  const rate = pricing.pro_extra_km_rate ?? DEFAULT_PRO_EXTRA_KM_RATE;
  const extra = Math.max(0, distanceKm - included);
  return Math.round(extra * rate * 100) / 100;
}

export type ProOwnerPayout = {
  ownerAmount: number;
  baseAmount: number;
  extraKmAmount: number;
  tierLabel: string | null;
  rentalDays: number;
};

/**
 * Calcule le reversement propriétaire selon la grille prix pro
 * + km supplémentaires si le kilométrage est connu.
 */
export function computeProOwnerPayout(
  pricing: VehicleProPricing,
  startDate: string,
  endDate: string,
  distanceKm?: number | null
): ProOwnerPayout | null {
  const rentalDays = countInclusiveDays(startDate, endDate);
  const weekendDominant = isWeekendDominantRental(startDate, endDate);
  const tier = pickTier(pricing, rentalDays, weekendDominant);

  if (!tier) return null;

  const extraKmAmount = computeExtraKmAmount(pricing, distanceKm);
  const ownerAmount = Math.round((tier.baseAmount + extraKmAmount) * 100) / 100;

  return {
    ownerAmount,
    baseAmount: tier.baseAmount,
    extraKmAmount,
    tierLabel: tier.label,
    rentalDays,
  };
}
