import { createClient } from "@/src/lib/supabase/server";

export type OwnerPortalVehicle = {
  vehicle_id: string;
  brand: string;
  model: string;
  year?: number | null;
  plate?: string | null;
  mileage?: number | null;
  initial_mileage?: number | null;
  status: string;
  image_url?: string | null;
  total_revenue?: number | null;
};

type DashboardVehicleRow = {
  vehicle_id: string;
  brand: string;
  model: string;
  year?: number | null;
  mileage?: number | null;
  status: string;
  image_url?: string | null;
  total_revenue?: number | null;
  plate?: string | null;
  initial_mileage?: number | null;
};

export function ownerPortalContractMileage(vehicle: {
  initial_mileage?: number | null;
  mileage?: number | null;
}) {
  return vehicle.initial_mileage ?? vehicle.mileage ?? null;
}

function mapDashboardVehicle(row: DashboardVehicleRow): OwnerPortalVehicle {
  return {
    vehicle_id: row.vehicle_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    plate: row.plate ?? null,
    mileage: row.mileage,
    initial_mileage: row.initial_mileage ?? null,
    status: row.status,
    image_url: row.image_url,
    total_revenue: row.total_revenue,
  };
}

async function fetchFromDashboard(ownerId: string) {
  const supabase = await createClient();

  const extendedSelect =
    "vehicle_id, brand, model, year, mileage, status, image_url, total_revenue, plate, initial_mileage";

  const extended = await supabase
    .from("owner_vehicle_dashboard")
    .select(extendedSelect)
    .eq("owner_id", ownerId)
    .order("brand", { ascending: true });

  if (!extended.error) {
    return (extended.data ?? []) as DashboardVehicleRow[];
  }

  const basic = await supabase
    .from("owner_vehicle_dashboard")
    .select(
      "vehicle_id, brand, model, year, mileage, status, image_url, total_revenue"
    )
    .eq("owner_id", ownerId)
    .order("brand", { ascending: true });

  return (basic.data ?? []) as DashboardVehicleRow[];
}

async function enrichVehicleExtras(
  vehicles: OwnerPortalVehicle[]
): Promise<OwnerPortalVehicle[]> {
  if (vehicles.length === 0) return vehicles;

  const supabase = await createClient();
  const vehicleIds = vehicles.map((vehicle) => vehicle.vehicle_id);

  const withInitial = await supabase
    .from("vehicles")
    .select("id, plate, initial_mileage")
    .in("id", vehicleIds);

  let extras = withInitial.data;

  if (withInitial.error?.message.includes("initial_mileage")) {
    const fallback = await supabase
      .from("vehicles")
      .select("id, plate")
      .in("id", vehicleIds);
    extras = (fallback.data ?? []).map((row) => ({
      ...row,
      initial_mileage: null,
    }));
  }

  if (!extras?.length) {
    return vehicles;
  }

  const extrasMap = new Map(
    extras.map((row) => [
      row.id,
      { plate: row.plate, initial_mileage: row.initial_mileage },
    ])
  );

  return vehicles.map((vehicle) => {
    const extra = extrasMap.get(vehicle.vehicle_id);
    if (!extra) return vehicle;

    return {
      ...vehicle,
      plate: vehicle.plate ?? extra.plate ?? null,
      initial_mileage:
        vehicle.initial_mileage ?? extra.initial_mileage ?? null,
    };
  });
}

export async function fetchOwnerPortalVehicles(
  ownerId: string
): Promise<OwnerPortalVehicle[]> {
  const dashboardRows = await fetchFromDashboard(ownerId);
  const vehicles = dashboardRows.map(mapDashboardVehicle);
  return enrichVehicleExtras(vehicles);
}

export async function fetchOwnerPortalVehicle(
  ownerId: string,
  vehicleId: string
): Promise<OwnerPortalVehicle | null> {
  const supabase = await createClient();

  const extendedSelect =
    "vehicle_id, brand, model, year, mileage, status, image_url, total_revenue, plate, initial_mileage";

  let row: DashboardVehicleRow | null = null;

  const extended = await supabase
    .from("owner_vehicle_dashboard")
    .select(extendedSelect)
    .eq("vehicle_id", vehicleId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (!extended.error && extended.data) {
    row = extended.data as DashboardVehicleRow;
  } else {
    const basic = await supabase
      .from("owner_vehicle_dashboard")
      .select(
        "vehicle_id, brand, model, year, mileage, status, image_url, total_revenue"
      )
      .eq("vehicle_id", vehicleId)
      .eq("owner_id", ownerId)
      .maybeSingle();

    row = (basic.data as DashboardVehicleRow | null) ?? null;
  }

  if (!row) return null;

  const [vehicle] = await enrichVehicleExtras([mapDashboardVehicle(row)]);
  return vehicle ?? null;
}
