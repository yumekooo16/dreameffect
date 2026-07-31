"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { requireAdmin } from "@/src/lib/admin/auth";
import type { ReservationFormData } from "@/src/lib/admin/reservations-types";
import type { ReservationRecord } from "@/src/lib/admin/reservations-types";
import {
  notifyReservationCreated,
  notifyReservationModified,
  notifyReservationStatusChanged,
} from "@/src/lib/admin/reservations-notifications";
import { syncVehicleStatusFromReservations } from "@/src/lib/vehicles/sync-status";

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

function revalidateReservationPaths(id?: string) {
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/reservations/${id}`);
  revalidatePath("/admin/vehicules");
  revalidatePath("/admin/proprietaires");
  revalidatePath("/espace-proprietaire");
}

async function getVehicleInfo(vehicleId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("brand, model, owner_id")
    .eq("id", vehicleId)
    .single();

  return data;
}

function buildPayload(data: ReservationFormData) {
  return {
    vehicle_id: data.vehicle_id,
    customer_name: data.customer_name.trim(),
    customer_email: data.customer_email.trim() || null,
    start_date: data.start_date,
    end_date: data.end_date,
    pickup_location: data.pickup_location.trim() || null,
    return_location: data.return_location.trim() || null,
    total_price: data.total_price,
    owner_amount: data.owner_amount,
    company_amount: data.company_amount,
    distance_km: data.distance_km,
    status: data.status,
    updated_at: new Date().toISOString(),
  };
}

function validateFinishedDistance(data: ReservationFormData): string | null {
  if (data.status !== "finished") return null;
  if (data.distance_km == null || data.distance_km < 0) {
    return "Indiquez le kilométrage parcouru par le client";
  }
  return null;
}

function reservationWasModified(
  before: ReservationRecord,
  after: ReservationRecord
) {
  return (
    before.vehicle_id !== after.vehicle_id ||
    before.customer_name !== after.customer_name ||
    before.customer_email !== after.customer_email ||
    before.start_date !== after.start_date ||
    before.end_date !== after.end_date ||
    before.pickup_location !== after.pickup_location ||
    before.return_location !== after.return_location ||
    Number(before.total_price ?? 0) !== Number(after.total_price ?? 0) ||
    Number(before.owner_amount ?? 0) !== Number(after.owner_amount ?? 0) ||
    Number(before.company_amount ?? 0) !== Number(after.company_amount ?? 0) ||
    before.distance_km !== after.distance_km
  );
}

export async function createReservation(
  data: ReservationFormData
): Promise<ActionResult> {
  const { user } = await requireAdmin();

  const distanceError = validateFinishedDistance(data);
  if (distanceError) {
    return { success: false, error: distanceError };
  }

  const supabase = await createClient();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert(buildPayload({ ...data, status: data.status || "pending" }))
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price, distance_km"
    )
    .single();

  if (error || !reservation) {
    return { success: false, error: error?.message ?? "Création impossible" };
  }

  const vehicle = await getVehicleInfo(reservation.vehicle_id);

  if (vehicle) {
    await notifyReservationCreated(
      supabase,
      reservation as ReservationRecord,
      vehicle,
      user.id
    );
  }

  await syncVehicleStatusFromReservations(reservation.vehicle_id);

  revalidateReservationPaths(reservation.id);
  return { success: true, id: reservation.id };
}

export async function updateReservation(
  reservationId: string,
  data: ReservationFormData
): Promise<ActionResult> {
  const { user } = await requireAdmin();

  const distanceError = validateFinishedDistance(data);
  if (distanceError) {
    return { success: false, error: distanceError };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reservations")
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price, distance_km"
    )
    .eq("id", reservationId)
    .single();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .update(buildPayload(data))
    .eq("id", reservationId)
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price, distance_km"
    )
    .single();

  if (error || !reservation) {
    return { success: false, error: error?.message ?? "Mise à jour impossible" };
  }

  const vehicle = await getVehicleInfo(reservation.vehicle_id);

  if (vehicle && existing) {
    if (existing.status !== reservation.status) {
      await notifyReservationStatusChanged(
        supabase,
        reservation as ReservationRecord,
        vehicle,
        user.id,
        existing.status
      );
    } else if (
      reservationWasModified(
        existing as ReservationRecord,
        reservation as ReservationRecord
      )
    ) {
      await notifyReservationModified(
        supabase,
        reservation as ReservationRecord,
        vehicle,
        user.id
      );
    }
  }

  await syncVehicleStatusFromReservations(reservation.vehicle_id);
  if (existing?.vehicle_id && existing.vehicle_id !== reservation.vehicle_id) {
    await syncVehicleStatusFromReservations(existing.vehicle_id);
  }

  revalidateReservationPaths(reservationId);
  return { success: true, id: reservationId };
}

async function updateReservationStatus(
  reservationId: string,
  status: ReservationFormData["status"]
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reservations")
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price"
    )
    .eq("id", reservationId)
    .single();

  if (!existing) {
    return { success: false, error: "Réservation introuvable" };
  }

  const { data: reservation, error } = await supabase
    .from("reservations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reservationId)
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price"
    )
    .single();

  if (error || !reservation) {
    return { success: false, error: error.message };
  }

  const vehicle = await getVehicleInfo(reservation.vehicle_id);

  if (vehicle && existing.status !== status) {
    await notifyReservationStatusChanged(
      supabase,
      reservation as ReservationRecord,
      vehicle,
      user.id,
      existing.status
    );
  }

  await syncVehicleStatusFromReservations(reservation.vehicle_id);

  revalidateReservationPaths(reservationId);
  return { success: true, id: reservationId };
}

export async function confirmReservation(reservationId: string) {
  return updateReservationStatus(reservationId, "confirmed");
}

export async function cancelReservation(reservationId: string) {
  return updateReservationStatus(reservationId, "cancelled");
}

export async function finishReservation(
  reservationId: string,
  distanceKm: number
): Promise<ActionResult> {
  if (Number.isNaN(distanceKm) || distanceKm < 0) {
    return { success: false, error: "Kilométrage parcouru invalide" };
  }

  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reservations")
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price, distance_km"
    )
    .eq("id", reservationId)
    .single();

  if (!existing) {
    return { success: false, error: "Réservation introuvable" };
  }

  const { data: reservation, error } = await supabase
    .from("reservations")
    .update({
      status: "finished",
      distance_km: distanceKm,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId)
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price, distance_km"
    )
    .single();

  if (error || !reservation) {
    return { success: false, error: error?.message ?? "Mise à jour impossible" };
  }

  const vehicle = await getVehicleInfo(reservation.vehicle_id);

  if (vehicle && existing.status !== "finished") {
    await notifyReservationStatusChanged(
      supabase,
      reservation as ReservationRecord,
      vehicle,
      user.id,
      existing.status
    );
  }

  await syncVehicleStatusFromReservations(reservation.vehicle_id);

  revalidateReservationPaths(reservationId);
  return { success: true, id: reservationId };
}
