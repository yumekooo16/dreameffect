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
import { buildVehicleSlug } from "@/src/lib/public/vehicle-slug";
import { splitRevenue } from "@/src/lib/revenue/split";
import {
  accrueReservationDailyRevenue,
  type ReservationForDailyLedger,
} from "@/src/lib/revenue/daily-ledger";

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
  revalidatePath("/vehicules");
}

async function revalidatePublicVehiclePaths(vehicleId: string) {
  revalidatePath("/vehicules");

  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("slug, brand, model, version, id")
    .eq("id", vehicleId)
    .maybeSingle();

  if (!data) return;

  if (data.slug) {
    revalidatePath(`/vehicules/${data.slug}`);
    return;
  }

  revalidatePath(
    `/vehicules/${buildVehicleSlug(data.brand, data.model, data.version)}-${data.id.slice(0, 8)}`
  );
}

async function revalidateReservationAndPublicPaths(
  reservationId?: string,
  vehicleIds: Array<string | null | undefined> = []
) {
  revalidateReservationPaths(reservationId);

  for (const vehicleId of [...new Set(vehicleIds.filter(Boolean) as string[])]) {
    await revalidatePublicVehiclePaths(vehicleId);
  }
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
  const { ownerAmount, companyAmount } = splitRevenue(data.total_price);

  return {
    vehicle_id: data.vehicle_id,
    customer_name: data.customer_name.trim(),
    customer_email: data.customer_email.trim() || null,
    start_date: data.start_date,
    end_date: data.end_date,
    pickup_location: data.pickup_location.trim() || null,
    return_location: data.return_location.trim() || null,
    total_price: data.total_price,
    owner_amount: ownerAmount,
    company_amount: companyAmount,
    distance_km: data.distance_km,
    status: data.status,
    updated_at: new Date().toISOString(),
  };
}

function validateReservationDates(data: ReservationFormData): string | null {
  if (!data.start_date || !data.end_date) {
    return "Dates de début et de fin requises";
  }
  if (data.end_date < data.start_date) {
    return "La date de fin doit être postérieure ou égale à la date de début";
  }
  return null;
}

/** Chevauchement inclusif [start, end] avec réservations pending/confirmed. */
async function findOverlappingReservation(
  vehicleId: string,
  startDate: string,
  endDate: string,
  excludeId?: string
): Promise<string | null> {
  const supabase = await createClient();

  let query = supabase
    .from("reservations")
    .select("id, start_date, end_date, status, customer_name")
    .eq("vehicle_id", vehicleId)
    .in("status", ["pending", "confirmed"])
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) {
    console.error("[reservations:overlap]", error.message);
    return "Impossible de vérifier les disponibilités";
  }

  if (data) {
    return `Chevauchement avec une réservation existante (${data.start_date} → ${data.end_date})`;
  }

  return null;
}

function validateFinishedDistance(data: ReservationFormData): string | null {
  if (data.status !== "finished") return null;
  if (data.distance_km == null || data.distance_km < 0) {
    return "Indiquez le kilométrage parcouru par le client";
  }
  return null;
}

async function syncDailyRevenueForConfirmedReservation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reservation: ReservationForDailyLedger
) {
  if (reservation.status !== "confirmed") return;

  const vehicle = await getVehicleInfo(reservation.vehicle_id);
  if (!vehicle?.owner_id) return;

  try {
    await accrueReservationDailyRevenue(
      supabase,
      reservation,
      vehicle.owner_id
    );
  } catch (error) {
    console.error("[syncDailyRevenueForConfirmedReservation]", error);
  }
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

  const datesError = validateReservationDates(data);
  if (datesError) {
    return { success: false, error: datesError };
  }

  const distanceError = validateFinishedDistance(data);
  if (distanceError) {
    return { success: false, error: distanceError };
  }

  const status = data.status || "pending";
  if (status === "pending" || status === "confirmed") {
    const overlapError = await findOverlappingReservation(
      data.vehicle_id,
      data.start_date,
      data.end_date
    );
    if (overlapError) {
      return { success: false, error: overlapError };
    }
  }

  const supabase = await createClient();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert(buildPayload({ ...data, status }))
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

  if (reservation.status === "confirmed") {
    await syncDailyRevenueForConfirmedReservation(
      supabase,
      reservation as ReservationForDailyLedger
    );
  }

  await revalidateReservationAndPublicPaths(reservation.id, [
    reservation.vehicle_id,
  ]);
  return { success: true, id: reservation.id };
}

export async function updateReservation(
  reservationId: string,
  data: ReservationFormData
): Promise<ActionResult> {
  const { user } = await requireAdmin();

  const datesError = validateReservationDates(data);
  if (datesError) {
    return { success: false, error: datesError };
  }

  const distanceError = validateFinishedDistance(data);
  if (distanceError) {
    return { success: false, error: distanceError };
  }

  if (data.status === "pending" || data.status === "confirmed") {
    const overlapError = await findOverlappingReservation(
      data.vehicle_id,
      data.start_date,
      data.end_date,
      reservationId
    );
    if (overlapError) {
      return { success: false, error: overlapError };
    }
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

  if (reservation.status === "confirmed") {
    await syncDailyRevenueForConfirmedReservation(
      supabase,
      reservation as ReservationForDailyLedger
    );
  }

  await revalidateReservationAndPublicPaths(reservationId, [
    reservation.vehicle_id,
    existing?.vehicle_id,
  ]);
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

  if (reservation.status === "confirmed") {
    await syncDailyRevenueForConfirmedReservation(
      supabase,
      reservation as ReservationForDailyLedger
    );
  }

  await revalidateReservationAndPublicPaths(reservationId, [
    reservation.vehicle_id,
  ]);
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

  await revalidateReservationAndPublicPaths(reservationId, [
    reservation.vehicle_id,
  ]);
  return { success: true, id: reservationId };
}

export async function deleteReservation(
  reservationId: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reservations")
    .select("id, vehicle_id, customer_name")
    .eq("id", reservationId)
    .single();

  if (!existing) {
    return { success: false, error: "Réservation introuvable" };
  }

  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", reservationId);

  if (error) {
    return { success: false, error: error.message };
  }

  await syncVehicleStatusFromReservations(existing.vehicle_id);
  await revalidateReservationAndPublicPaths(undefined, [existing.vehicle_id]);

  return { success: true };
}
