import {
  getLowestRentalPrice,
  formatPrice,
  type VehiclePricing,
} from "@/src/lib/vehicles/pricing";

export function getInformativeDailyRate(pricing: VehiclePricing) {
  return pricing.price_24h_weekday ?? getLowestRentalPrice(pricing);
}

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
