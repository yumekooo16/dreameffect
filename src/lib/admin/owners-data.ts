import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { ReservationRow } from "@/src/lib/admin/dashboard-data";
import { syncVehicleStatusesForVehicles } from "@/src/lib/vehicles/sync-status";
import {
  computeOwnerRevenue,
  type OwnerListItem,
  type OwnerProfile,
  type OwnerReservation,
  type OwnerVehicle,
} from "@/src/lib/admin/owners-types";

function isUserBanned(bannedUntil?: string | null) {
  if (!bannedUntil) return false;
  return new Date(bannedUntil) > new Date();
}

async function fetchBannedOwnerIds(): Promise<Set<string>> {
  const admin = createAdminClient();
  const banned = new Set<string>();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error || !data.users.length) break;

    for (const user of data.users) {
      if (isUserBanned(user.banned_until)) {
        banned.add(user.id);
      }
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return banned;
}

export async function fetchOwnersList(): Promise<OwnerListItem[]> {
  const supabase = await createClient();

  const [ownersRes, vehiclesRes, reservationsRes, bannedIds] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, role, created_at")
        .eq("role", "owner")
        .order("last_name", { ascending: true }),
      supabase
        .from("owner_vehicle_dashboard")
        .select("vehicle_id, owner_id, total_revenue"),
      supabase
        .from("reservations")
        .select("id, vehicle_id, status"),
      fetchBannedOwnerIds(),
    ]);

  const owners = (ownersRes.data ?? []) as OwnerProfile[];
  const vehicles = vehiclesRes.data ?? [];
  const reservations = reservationsRes.data ?? [];

  const vehiclesByOwner = new Map<string, typeof vehicles>();
  for (const vehicle of vehicles) {
    const list = vehiclesByOwner.get(vehicle.owner_id) ?? [];
    list.push(vehicle);
    vehiclesByOwner.set(vehicle.owner_id, list);
  }

  const vehicleOwnerMap = new Map<string, string>();
  for (const vehicle of vehicles) {
    vehicleOwnerMap.set(vehicle.vehicle_id, vehicle.owner_id);
  }

  const reservationsByOwner = new Map<string, number>();
  for (const reservation of reservations) {
    if (reservation.status === "cancelled") continue;
    const ownerId = vehicleOwnerMap.get(reservation.vehicle_id);
    if (!ownerId) continue;
    reservationsByOwner.set(
      ownerId,
      (reservationsByOwner.get(ownerId) ?? 0) + 1
    );
  }

  return owners.map((owner) => {
    const ownerVehicles = vehiclesByOwner.get(owner.id) ?? [];
    const totalRevenue = ownerVehicles.reduce(
      (sum, v) => sum + Number(v.total_revenue ?? 0),
      0
    );

    return {
      ...owner,
      vehicleCount: ownerVehicles.length,
      reservationCount: reservationsByOwner.get(owner.id) ?? 0,
      totalRevenue,
      isActive: !bannedIds.has(owner.id),
    };
  });
}

export async function fetchOwnerDetail(ownerId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, role, created_at")
    .eq("id", ownerId)
    .eq("role", "owner")
    .single();

  if (ownerError || !owner) {
    return null;
  }

  const { data: vehiclesData } = await supabase
    .from("vehicles")
    .select(
      "id, brand, model, year, plate, mileage, initial_mileage, status, image_url"
    )
    .eq("owner_id", ownerId)
    .order("brand", { ascending: true });

  const vehicleIds = (vehiclesData ?? []).map((vehicle) => vehicle.id);
  await syncVehicleStatusesForVehicles(vehicleIds);

  const { data: refreshedVehicles } = await supabase
    .from("vehicles")
    .select(
      "id, brand, model, year, plate, mileage, initial_mileage, status, image_url"
    )
    .eq("owner_id", ownerId)
    .order("brand", { ascending: true });

  const { data: dashboardData } = await supabase
    .from("owner_vehicle_dashboard")
    .select("vehicle_id, total_revenue")
    .eq("owner_id", ownerId);

  const revenueByVehicle = new Map(
    (dashboardData ?? []).map((row) => [row.vehicle_id, row.total_revenue])
  );

  const vehicles: OwnerVehicle[] = (refreshedVehicles ?? vehiclesData ?? []).map(
    (vehicle) => ({
      vehicle_id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      mileage: vehicle.mileage,
      initial_mileage: vehicle.initial_mileage,
      status: vehicle.status,
      image_url: vehicle.image_url,
      total_revenue: revenueByVehicle.get(vehicle.id) ?? 0,
    })
  );

  let reservations: ReservationRow[] = [];

  if (vehicleIds.length > 0) {
    const { data: reservationsData } = await supabase
      .from("reservations")
      .select(
        "id, vehicle_id, start_date, end_date, customer_name, customer_email, status, owner_amount, company_amount, total_price, distance_km"
      )
      .in("vehicle_id", vehicleIds)
      .order("start_date", { ascending: false });

    reservations = (reservationsData ?? []) as ReservationRow[];
  }

  const vehicleMap = new Map(
    vehicles.map((v) => [v.vehicle_id, `${v.brand} ${v.model}`])
  );

  const reservationsWithVehicle: OwnerReservation[] = reservations.map(
    (reservation) => ({
      ...reservation,
      vehicleLabel: vehicleMap.get(reservation.vehicle_id) ?? "Véhicule",
    })
  );

  const { data: authData } = await admin.auth.admin.getUserById(ownerId);
  const isActive = !isUserBanned(authData.user?.banned_until);

  return {
    owner: owner as OwnerProfile,
    vehicles,
    reservations: reservationsWithVehicle,
    revenue: computeOwnerRevenue(reservations),
    isActive,
  };
}
