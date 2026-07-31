import { createClient } from "@/src/lib/supabase/server";
import {
  computeCostByMonth,
  computeCostByVehicle,
  computeMaintenanceStats,
  type MaintenanceDetail,
  type MaintenanceListItem,
  type MaintenanceRecord,
} from "@/src/lib/admin/maintenance-types";

function ownerDisplayName(
  owner?: { first_name: string | null; last_name: string | null } | null
) {
  if (!owner) return "Propriétaire inconnu";
  const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

function enrichMaintenance(
  records: MaintenanceRecord[],
  vehicles: Map<
    string,
    {
      brand: string;
      model: string;
      image_url?: string | null;
      mileage: number;
      owner_id: string;
    }
  >,
  owners: Map<
    string,
    { first_name: string | null; last_name: string | null }
  >
): MaintenanceListItem[] {
  return records.map((record) => {
    const vehicle = vehicles.get(record.vehicle_id);

    return {
      ...record,
      vehicle_label: vehicle
        ? `${vehicle.brand} ${vehicle.model}`
        : "Véhicule inconnu",
      vehicle_image_url: vehicle?.image_url ?? null,
      vehicle_mileage: vehicle?.mileage ?? 0,
      owner_id: vehicle?.owner_id ?? "",
      owner_name: ownerDisplayName(
        vehicle ? owners.get(vehicle.owner_id) : null
      ),
    };
  });
}

async function fetchLookups(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [vehiclesRes, ownersRes] = await Promise.all([
    supabase
      .from("owner_vehicle_dashboard")
      .select("vehicle_id, owner_id, brand, model, image_url, mileage"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "owner"),
  ]);

  const vehicles = new Map(
    (vehiclesRes.data ?? []).map((vehicle) => [
      vehicle.vehicle_id,
      {
        brand: vehicle.brand,
        model: vehicle.model,
        image_url: vehicle.image_url,
        mileage: vehicle.mileage ?? 0,
        owner_id: vehicle.owner_id,
      },
    ])
  );

  const owners = new Map(
    (ownersRes.data ?? []).map((owner) => [owner.id, owner])
  );

  return { vehicles, owners };
}

export async function fetchMaintenanceList() {
  const supabase = await createClient();

  const [maintenanceRes, lookups] = await Promise.all([
    supabase
      .from("maintenance")
      .select(
        "id, vehicle_id, title, type, description, mileage, maintenance_date, next_due_date, cost, provider, created_at, updated_at, created_by"
      )
      .order("maintenance_date", { ascending: false }),
    fetchLookups(supabase),
  ]);

  const records = (maintenanceRes.data ?? []) as MaintenanceRecord[];
  const items = enrichMaintenance(records, lookups.vehicles, lookups.owners);
  const stats = computeMaintenanceStats(items);
  const costByVehicle = computeCostByVehicle(items);
  const costByMonth = computeCostByMonth(items);

  return { items, stats, costByVehicle, costByMonth };
}

export async function fetchMaintenanceDetail(
  maintenanceId: string
): Promise<MaintenanceDetail | null> {
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("maintenance")
    .select(
      "id, vehicle_id, title, type, description, mileage, maintenance_date, next_due_date, cost, provider, created_at, updated_at, created_by"
    )
    .eq("id", maintenanceId)
    .single();

  if (error || !record) {
    return null;
  }

  const maintenance = record as MaintenanceRecord;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, brand, model, image_url, mileage, owner_id")
    .eq("id", maintenance.vehicle_id)
    .single();

  if (!vehicle) {
    return null;
  }

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone")
    .eq("id", vehicle.owner_id)
    .single();

  const base: MaintenanceListItem = {
    ...maintenance,
    vehicle_label: `${vehicle.brand} ${vehicle.model}`,
    vehicle_image_url: vehicle.image_url,
    vehicle_mileage: vehicle.mileage ?? 0,
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
  };
}

export async function fetchVehiclesForMaintenanceForm() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("owner_vehicle_dashboard")
    .select("vehicle_id, brand, model, owner_id, mileage")
    .order("brand", { ascending: true });

  const ownersRes = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "owner");

  const owners = new Map(
    (ownersRes.data ?? []).map((owner) => [owner.id, ownerDisplayName(owner)])
  );

  return (data ?? []).map((vehicle) => ({
    id: vehicle.vehicle_id,
    label: `${vehicle.brand} ${vehicle.model} — ${owners.get(vehicle.owner_id) ?? "Propriétaire"}`,
    mileage: vehicle.mileage ?? 0,
  }));
}

export async function fetchOwnersForMaintenanceFilter() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "owner")
    .order("last_name", { ascending: true });

  return (data ?? []).map((owner) => ({
    id: owner.id,
    label: ownerDisplayName(owner),
  }));
}
