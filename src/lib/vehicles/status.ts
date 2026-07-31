export const VEHICLE_STATUSES = [
  {
    value: "available",
    label: "Disponible",
    badgeClass: "de-badge--available",
  },
  {
    value: "rented",
    label: "En location",
    badgeClass: "de-badge--confirmed",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    badgeClass: "de-badge--pending",
  },
  {
    value: "unavailable",
    label: "Indisponible",
    badgeClass: "de-badge--unavailable",
  },
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number]["value"];

export function getVehicleStatusLabel(status?: string | null) {
  return (
    VEHICLE_STATUSES.find((item) => item.value === status)?.label ??
    status ??
    "—"
  );
}

export function getVehicleStatusBadgeClass(status?: string | null) {
  return (
    VEHICLE_STATUSES.find((item) => item.value === status)?.badgeClass ??
    "de-badge--finished"
  );
}
