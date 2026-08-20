import { createAdminClient } from "@/src/lib/supabase/admin";
import { isCalendarBlockingReservation } from "@/src/lib/reservations/status";

export type BlockedPeriod = {
  start: string;
  end: string;
};

export type VehicleAvailability = {
  blockedPeriods: BlockedPeriod[];
  maintenanceDays: string[];
};

export async function fetchVehicleAvailability(
  vehicleId: string
): Promise<VehicleAvailability> {
  const supabase = createAdminClient();

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, is_published")
    .eq("id", vehicleId)
    .maybeSingle();

  if (vehicleError) {
    console.error("[fetchVehicleAvailability:vehicle]", vehicleError.message);
    return { blockedPeriods: [], maintenanceDays: [] };
  }

  // Ne pas exposer le calendrier métier d'un véhicule non publié
  if (!vehicle?.is_published) {
    return { blockedPeriods: [], maintenanceDays: [] };
  }

  const [reservationsRes, maintenanceRes] = await Promise.all([
    supabase
      .from("reservations")
      .select("start_date, end_date, status")
      .eq("vehicle_id", vehicleId),
    supabase
      .from("maintenance")
      .select("maintenance_date")
      .eq("vehicle_id", vehicleId)
      .not("maintenance_date", "is", null),
  ]);

  if (reservationsRes.error) {
    console.error(
      "[fetchVehicleAvailability:reservations]",
      reservationsRes.error.message
    );
  }

  if (maintenanceRes.error) {
    console.error(
      "[fetchVehicleAvailability:maintenance]",
      maintenanceRes.error.message
    );
  }

  const blockedPeriods = (reservationsRes.data ?? [])
    .filter((reservation) => isCalendarBlockingReservation(reservation))
    .map((reservation) => ({
      start: reservation.start_date,
      end: reservation.end_date,
    }));

  const maintenanceDays = (maintenanceRes.data ?? [])
    .map((item) => item.maintenance_date)
    .filter((date): date is string => Boolean(date));

  return { blockedPeriods, maintenanceDays };
}
