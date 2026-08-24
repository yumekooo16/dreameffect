import { createClient } from "@/src/lib/supabase/server";
import {
  computeReservationStats,
  type ReservationDetail,
  type ReservationListItem,
  type ReservationRecord,
} from "@/src/lib/admin/reservations-types";

function ownerDisplayName(
  owner?: { first_name: string | null; last_name: string | null } | null
) {
  if (!owner) return "Propriétaire inconnu";
  const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

function enrichReservations(
  reservations: ReservationRecord[],
  vehicles: Map<
    string,
    {
      brand: string;
      model: string;
      image_url?: string | null;
      owner_id: string;
    }
  >,
  owners: Map<
    string,
    { first_name: string | null; last_name: string | null }
  >
): ReservationListItem[] {
  return reservations.map((reservation) => {
    const vehicle = vehicles.get(reservation.vehicle_id);

    return {
      ...reservation,
      vehicle_label: vehicle
        ? `${vehicle.brand} ${vehicle.model}`
        : "Véhicule inconnu",
      vehicle_image_url: vehicle?.image_url ?? null,
      owner_id: vehicle?.owner_id ?? "",
      owner_name: ownerDisplayName(
        vehicle ? owners.get(vehicle.owner_id) : null
      ),
    };
  });
}

export async function fetchReservationsList() {
  const supabase = await createClient();

  const [reservationsRes, vehiclesRes, ownersRes] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price, distance_km, created_at, updated_at"
      )
      .order("start_date", { ascending: false }),
    supabase
      .from("owner_vehicle_dashboard")
      .select("vehicle_id, owner_id, brand, model, image_url"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "owner"),
  ]);

  const reservations = (reservationsRes.data ?? []) as ReservationRecord[];

  const vehicles = new Map(
    (vehiclesRes.data ?? []).map((vehicle) => [
      vehicle.vehicle_id,
      {
        brand: vehicle.brand,
        model: vehicle.model,
        image_url: vehicle.image_url,
        owner_id: vehicle.owner_id,
      },
    ])
  );

  const owners = new Map(
    (ownersRes.data ?? []).map((owner) => [owner.id, owner])
  );

  const items = enrichReservations(reservations, vehicles, owners);
  const stats = computeReservationStats(reservations);

  return { items, stats, reservations };
}

export async function fetchReservationDetail(
  reservationId: string
): Promise<ReservationDetail | null> {
  const supabase = await createClient();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select(
      "id, vehicle_id, start_date, end_date, customer_name, customer_email, pickup_location, return_location, status, owner_amount, company_amount, total_price, distance_km, created_at, updated_at"
    )
    .eq("id", reservationId)
    .single();

  if (error || !reservation) {
    return null;
  }

  const record = reservation as ReservationRecord;

  const { data: dashboardVehicle } = await supabase
    .from("owner_vehicle_dashboard")
    .select("vehicle_id, brand, model, image_url, owner_id")
    .eq("vehicle_id", record.vehicle_id)
    .maybeSingle();

  const { data: rawVehicle } = dashboardVehicle
    ? { data: null }
    : await supabase
        .from("vehicles")
        .select("id, brand, model, image_url, owner_id")
        .eq("id", record.vehicle_id)
        .maybeSingle();

  const vehicle = dashboardVehicle
    ? {
        id: dashboardVehicle.vehicle_id,
        brand: dashboardVehicle.brand,
        model: dashboardVehicle.model,
        image_url: dashboardVehicle.image_url,
        owner_id: dashboardVehicle.owner_id,
      }
    : rawVehicle;

  if (!vehicle) {
    return null;
  }

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone")
    .eq("id", vehicle.owner_id)
    .single();

  let clientHistory = {
    total_reservations: 0,
    finished_reservations: 0,
    total_spent: 0,
  };

  if (record.customer_email) {
    const { data: clientReservations } = await supabase
      .from("reservations")
      .select("status, total_price")
      .eq("customer_email", record.customer_email);

    const rows = clientReservations ?? [];
    const finished = rows.filter((r) => r.status === "finished");

    clientHistory = {
      total_reservations: rows.length,
      finished_reservations: finished.length,
      total_spent: finished.reduce(
        (sum, r) => sum + Number(r.total_price ?? 0),
        0
      ),
    };
  }

  const base: ReservationListItem = {
    ...record,
    vehicle_label: `${vehicle.brand} ${vehicle.model}`,
    vehicle_image_url: vehicle.image_url,
    owner_id: vehicle.owner_id,
    owner_name: ownerDisplayName(owner),
  };

  return {
    ...base,
    vehicle,
    owner: owner ?? {
      id: vehicle.owner_id,
      first_name: null,
      last_name: null,
      phone: null,
    },
    client_history: clientHistory,
  };
}

export async function fetchVehiclesForReservationForm() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("owner_vehicle_dashboard")
    .select("vehicle_id, brand, model, owner_id")
    .order("brand", { ascending: true });

  const ownersRes = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "owner");

  const owners = new Map(
    (ownersRes.data ?? []).map((owner) => [owner.id, ownerDisplayName(owner)])
  );

  const { fetchVehiclesRevenueFormConfigs } = await import(
    "@/src/lib/revenue/owner-settings"
  );
  const revenueConfigs = await fetchVehiclesRevenueFormConfigs(supabase);

  return {
    vehicles: (data ?? []).map((vehicle) => ({
      id: vehicle.vehicle_id,
      label: `${vehicle.brand} ${vehicle.model} — ${owners.get(vehicle.owner_id) ?? "Propriétaire"}`,
    })),
    revenueConfigs,
  };
}
