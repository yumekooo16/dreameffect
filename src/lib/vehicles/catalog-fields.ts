export const FUEL_OPTIONS = [
  { value: "essence", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "electrique", label: "Électrique" },
  { value: "hybride", label: "Hybride" },
  { value: "hybride_rechargeable", label: "Hybride rechargeable" },
] as const;

export const TRANSMISSION_OPTIONS = [
  { value: "automatique", label: "Automatique" },
  { value: "manuelle", label: "Manuelle" },
] as const;

export type FuelType = (typeof FUEL_OPTIONS)[number]["value"];
export type TransmissionType = (typeof TRANSMISSION_OPTIONS)[number]["value"];

export function getFuelLabel(value?: string | null) {
  return FUEL_OPTIONS.find((o) => o.value === value)?.label ?? null;
}

export function getTransmissionLabel(value?: string | null) {
  return TRANSMISSION_OPTIONS.find((o) => o.value === value)?.label ?? null;
}

export function formatPower(value?: number | null) {
  if (value == null || value <= 0) return null;
  return `${value.toLocaleString("fr-FR")} ch`;
}

export function formatDailyRate(value?: number | null) {
  if (value == null || value <= 0) return null;
  return `${Math.round(value).toLocaleString("fr-FR")} € / jour`;
}
