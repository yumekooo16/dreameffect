/** Statuts affichés sur le site vitrine — jamais les statuts internes admin. */
export type PublicVehicleStatus = "available" | "unavailable";

const PUBLIC_STATUS_LABELS: Record<PublicVehicleStatus, string> = {
  available: "Disponible",
  unavailable: "Indisponible",
};

const PUBLIC_STATUS_BADGE: Record<PublicVehicleStatus, string> = {
  available: "de-badge--available",
  unavailable: "de-badge--unavailable",
};

/** Convertit un statut interne en statut public (Disponible / Indisponible). */
export function toPublicVehicleStatus(
  internalStatus?: string | null
): PublicVehicleStatus {
  return internalStatus === "available" ? "available" : "unavailable";
}

export function getPublicVehicleStatusLabel(status: PublicVehicleStatus) {
  return PUBLIC_STATUS_LABELS[status];
}

export function getPublicVehicleStatusBadgeClass(status: PublicVehicleStatus) {
  return PUBLIC_STATUS_BADGE[status];
}
