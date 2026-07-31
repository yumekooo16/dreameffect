import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReservationRecord } from "@/src/lib/admin/reservations-types";
import { getReservationStatusLabel } from "@/src/lib/reservations/status";
import {
  createNotification,
  notifyAllAdmins,
  notifyOwnerAndAdmins,
} from "@/src/lib/notifications/service";

type VehicleInfo = {
  brand: string;
  model: string;
  owner_id: string;
};

function vehicleLabel(vehicle: VehicleInfo) {
  return `${vehicle.brand} ${vehicle.model}`;
}

export async function notifyReservationCreated(
  supabase: SupabaseClient,
  reservation: ReservationRecord,
  vehicle: VehicleInfo,
  adminUserId: string
) {
  const label = getReservationStatusLabel(reservation);
  const message = `${vehicleLabel(vehicle)} — ${reservation.customer_name ?? "Client"} (${label})`;

  await notifyOwnerAndAdmins(supabase, {
    ownerId: vehicle.owner_id,
    adminUserId,
    type: "reservation_created",
    title: "Nouvelle réservation",
    message,
    related_id: reservation.id,
  });
}

export async function notifyReservationModified(
  supabase: SupabaseClient,
  reservation: ReservationRecord,
  vehicle: VehicleInfo,
  adminUserId: string
) {
  const message = `${vehicleLabel(vehicle)} — ${reservation.customer_name ?? "Client"} (modification)`;

  await notifyOwnerAndAdmins(supabase, {
    ownerId: vehicle.owner_id,
    adminUserId,
    type: "reservation_modified",
    title: "Réservation modifiée",
    message,
    related_id: reservation.id,
  });
}

export async function notifyReservationStatusChanged(
  supabase: SupabaseClient,
  reservation: ReservationRecord,
  vehicle: VehicleInfo,
  adminUserId: string,
  previousStatus: string
) {
  const label = getReservationStatusLabel(reservation);
  const message = `${vehicleLabel(vehicle)} — statut : ${label} (avant : ${previousStatus})`;

  if (reservation.status === "cancelled") {
    await notifyOwnerAndAdmins(supabase, {
      ownerId: vehicle.owner_id,
      adminUserId,
      type: "reservation_cancelled",
      title: "Réservation annulée",
      message,
      related_id: reservation.id,
      priority: "high",
    });
    return;
  }

  await createNotification(supabase, {
    profile_id: vehicle.owner_id,
    type: "reservation_status",
    title: "Mise à jour de réservation",
    message,
    related_id: reservation.id,
    created_by: adminUserId,
  });

  await notifyAllAdmins(supabase, {
    excludeProfileId: adminUserId,
    type: "reservation_status",
    title: "Réservation mise à jour",
    message,
    related_id: reservation.id,
    created_by: adminUserId,
  });
}
