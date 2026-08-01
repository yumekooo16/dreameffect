export type VehiclePricing = {
  price_24h_weekday: number | null;
  price_24h_weekend: number | null;
  price_48h_weekend: number | null;
  price_72h_weekend: number | null;
  price_7_days: number | null;
  deposit: number | null;
};

export const PRICING_TIER_FIELDS = [
  {
    key: "price_24h_weekday" as const,
    label: "24 h — lundi à jeudi",
    shortLabel: "24 h semaine",
    hint: "Tarif journalier en semaine",
  },
  {
    key: "price_24h_weekend" as const,
    label: "24 h — week-end",
    shortLabel: "24 h week-end",
    hint: "Vendredi soir → dimanche soir",
  },
  {
    key: "price_48h_weekend" as const,
    label: "48 h — week-end",
    shortLabel: "48 h week-end",
    hint: "Week-end complet",
  },
  {
    key: "price_72h_weekend" as const,
    label: "72 h — week-end",
    shortLabel: "72 h week-end",
    hint: "Week-end prolongé",
  },
  {
    key: "price_7_days" as const,
    label: "Semaine (7 jours)",
    shortLabel: "7 jours",
    hint: "Forfait hebdomadaire",
  },
  {
    key: "deposit" as const,
    label: "Caution",
    shortLabel: "Caution",
    hint: "Montant de la caution",
  },
];

export const EMPTY_VEHICLE_PRICING: VehiclePricing = {
  price_24h_weekday: null,
  price_24h_weekend: null,
  price_48h_weekend: null,
  price_72h_weekend: null,
  price_7_days: null,
  deposit: null,
};

export function parsePricingValue(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function normalizeVehiclePricing(
  input: Partial<VehiclePricing> | null | undefined
): VehiclePricing {
  return {
    price_24h_weekday: parsePricingValue(input?.price_24h_weekday),
    price_24h_weekend: parsePricingValue(input?.price_24h_weekend),
    price_48h_weekend: parsePricingValue(input?.price_48h_weekend),
    price_72h_weekend: parsePricingValue(input?.price_72h_weekend),
    price_7_days: parsePricingValue(input?.price_7_days),
    deposit: parsePricingValue(input?.deposit),
  };
}

/** Tarif « à partir de » pour les cartes catalogue — plus bas tarif location. */
export function getLowestRentalPrice(pricing: VehiclePricing): number | null {
  const rentalPrices = [
    pricing.price_24h_weekday,
    pricing.price_24h_weekend,
    pricing.price_48h_weekend,
    pricing.price_72h_weekend,
    pricing.price_7_days,
  ].filter((price): price is number => price != null);

  if (rentalPrices.length === 0) return null;
  return Math.min(...rentalPrices);
}

export function formatPrice(value?: number | null, suffix = " €") {
  if (value == null || value <= 0) return null;
  return `${Math.round(value).toLocaleString("fr-FR")}${suffix}`;
}

export function formatPriceFrom(value?: number | null) {
  const formatted = formatPrice(value);
  return formatted ? `À partir de ${formatted}` : null;
}

export function getDisplayPricingTiers(pricing: VehiclePricing) {
  return PRICING_TIER_FIELDS.map((tier) => ({
    ...tier,
    value: pricing[tier.key],
    formatted: formatPrice(pricing[tier.key]),
  })).filter((tier) => tier.key === "deposit" || tier.formatted != null);
}

/** Sync daily_rate legacy column = tarif semaine ou plus bas disponible. */
export function deriveDailyRate(pricing: VehiclePricing): number | null {
  return pricing.price_24h_weekday ?? getLowestRentalPrice(pricing);
}
