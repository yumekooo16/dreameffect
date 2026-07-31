import type { ReservationRow } from "@/src/lib/admin/dashboard-data";

export type ReservationDisplayStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "finished"
  | "cancelled";

export const RESERVATION_STATUS_FILTERS = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "in_progress", label: "En cours" },
  { value: "finished", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
] as const;

const LABELS: Record<ReservationDisplayStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  in_progress: "En cours",
  finished: "Terminée",
  cancelled: "Annulée",
};

const BADGES: Record<ReservationDisplayStatus, string> = {
  pending: "de-badge--pending",
  confirmed: "de-badge--confirmed",
  in_progress: "de-badge--confirmed",
  finished: "de-badge--finished",
  cancelled: "de-badge--cancelled",
};

export function getReservationDisplayStatus(
  reservation: Pick<ReservationRow, "status" | "start_date" | "end_date">
): ReservationDisplayStatus {
  if (reservation.status === "cancelled") return "cancelled";
  if (reservation.status === "finished") return "finished";
  if (isActiveReservation(reservation)) return "in_progress";
  if (reservation.status === "confirmed") return "confirmed";
  return "pending";
}

export function getReservationStatusLabel(
  reservation: Pick<ReservationRow, "status" | "start_date" | "end_date">
) {
  return LABELS[getReservationDisplayStatus(reservation)];
}

export function getReservationStatusBadgeClass(
  reservation: Pick<ReservationRow, "status" | "start_date" | "end_date">
) {
  return BADGES[getReservationDisplayStatus(reservation)];
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isActiveReservation(
  reservation: Pick<ReservationRow, "status" | "start_date" | "end_date">
) {
  if (reservation.status !== "pending" && reservation.status !== "confirmed") {
    return false;
  }
  const now = startOfDay(new Date());
  const start = startOfDay(new Date(reservation.start_date));
  const end = startOfDay(new Date(reservation.end_date));
  return start <= now && end >= now;
}

export function isUpcomingReservation(
  reservation: Pick<ReservationRow, "status" | "start_date" | "end_date">
) {
  if (reservation.status !== "pending" && reservation.status !== "confirmed") {
    return false;
  }
  const now = startOfDay(new Date());
  const start = startOfDay(new Date(reservation.start_date));
  return start > now;
}

/** Réservation affichée comme occupée sur le calendrier (hors historique). */
export function isCalendarBlockingReservation(
  reservation: Pick<ReservationRow, "status">
) {
  return reservation.status === "pending" || reservation.status === "confirmed";
}

export function vehicleHasActiveRental(
  reservations: Pick<ReservationRow, "status" | "start_date" | "end_date">[]
) {
  return reservations.some(isActiveReservation);
}

export function splitReservations<T extends ReservationRow>(reservations: T[]) {
  const now = startOfDay(new Date());
  const past: T[] = [];
  const current: T[] = [];
  const upcoming: T[] = [];

  for (const reservation of reservations) {
    const start = startOfDay(new Date(reservation.start_date));
    const end = startOfDay(new Date(reservation.end_date));

    if (
      (reservation.status === "pending" || reservation.status === "confirmed") &&
      start <= now &&
      end >= now
    ) {
      current.push(reservation);
    } else if (
      (reservation.status === "pending" || reservation.status === "confirmed") &&
      start > now
    ) {
      upcoming.push(reservation);
    } else {
      past.push(reservation);
    }
  }

  return { past, current, upcoming };
}
