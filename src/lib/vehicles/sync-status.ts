import { createClient } from "@/src/lib/supabase/server";
import {
  isActiveReservation,
} from "@/src/lib/reservations/status";

/**
 * Aligne le statut véhicule avec les réservations actives.
 * Ne modifie pas maintenance / indisponible (décision admin manuelle).
 */
export async function syncVehicleStatusFromReservations(vehicleId: string) {
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", vehicleId)
    .single();

  if (!vehicle) return;

  if (vehicle.status === "maintenance" || vehicle.status === "unavailable") {
    return;
  }

  const { data: reservations } = await supabase
    .from("reservations")
    .select("status, start_date, end_date")
    .eq("vehicle_id", vehicleId);

  const hasActiveRental = (reservations ?? []).some(isActiveReservation);
  const nextStatus = hasActiveRental ? "rented" : "available";

  if (vehicle.status === nextStatus) return;

  await supabase
    .from("vehicles")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);
}

export async function syncVehicleStatusesForVehicles(vehicleIds: string[]) {
  if (vehicleIds.length === 0) return;
  await Promise.all(
    vehicleIds.map((vehicleId) => syncVehicleStatusFromReservations(vehicleId))
  );
}
