import { createClient } from "@/src/lib/supabase/server";
import type { ReservationRow } from "@/src/lib/admin/dashboard-data";
import { computeCostByVehicle } from "@/src/lib/admin/maintenance-types";
import type { MaintenanceListItem } from "@/src/lib/admin/maintenance-types";
import {
  buildFilterOptions,
  computeFinanceStats,
  computeFinancialHistory,
  computeMonthlyCommissions,
  computeMonthlyRevenues,
  computeOwnerFinanceList,
  computeVehicleFinanceList,
  type OwnerPayoutRecord,
} from "@/src/lib/admin/finance-types";

function ownerDisplayName(
  owner?: { first_name: string | null; last_name: string | null } | null
) {
  if (!owner) return "Propriétaire inconnu";
  const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

export async function fetchFinanceData() {
  const supabase = await createClient();

  const [
    vehiclesRes,
    reservationsRes,
    ownersRes,
    maintenanceRes,
    payoutsRes,
  ] = await Promise.all([
    supabase
      .from("owner_vehicle_dashboard")
      .select(
        "vehicle_id, brand, model, image_url, owner_id, total_revenue, status"
      ),
    supabase
      .from("reservations")
      .select(
        "id, vehicle_id, start_date, end_date, customer_name, status, owner_amount, company_amount, total_price"
      )
      .order("end_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "owner"),
    supabase
      .from("maintenance")
      .select(
        "id, vehicle_id, title, type, maintenance_date, cost, created_at"
      ),
    supabase
      .from("owner_payouts")
      .select(
        "id, owner_id, amount_due, amount_paid, period_start, period_end, status, notes, created_at, updated_at"
      )
      .order("created_at", { ascending: false }),
  ]);

  const vehicles = vehiclesRes.data ?? [];
  const reservations = (reservationsRes.data ?? []) as ReservationRow[];
  const owners = ownersRes.data ?? [];
  const maintenanceRows = maintenanceRes.data ?? [];

  const ownerNames = new Map<string, string>();
  for (const owner of owners) {
    ownerNames.set(owner.id, ownerDisplayName(owner));
  }

  const vehicleLabels = new Map<string, string>();
  const vehicleOwners = new Map<string, string>();
  for (const vehicle of vehicles) {
    vehicleLabels.set(
      vehicle.vehicle_id,
      `${vehicle.brand} ${vehicle.model}`
    );
    vehicleOwners.set(vehicle.vehicle_id, vehicle.owner_id);
  }

  const maintenanceItems: MaintenanceListItem[] = maintenanceRows.map(
    (item) => ({
      ...item,
      vehicle_label:
        vehicleLabels.get(item.vehicle_id) ?? "Véhicule inconnu",
      vehicle_mileage: 0,
      owner_id: vehicleOwners.get(item.vehicle_id) ?? "",
      owner_name:
        ownerNames.get(vehicleOwners.get(item.vehicle_id) ?? "") ??
        "Propriétaire",
    })
  );

  const costByVehicle = computeCostByVehicle(maintenanceItems);
  const maintenanceCosts = new Map(
    costByVehicle.map((row) => [row.vehicle_id, row.total_cost])
  );

  const stats = computeFinanceStats(reservations, vehicles);
  const monthlyRevenues = computeMonthlyRevenues(reservations);
  const monthlyCommissions = computeMonthlyCommissions(reservations);
  const vehicleFinance = computeVehicleFinanceList(
    vehicles,
    reservations,
    maintenanceCosts,
    ownerNames
  );
  const ownerFinance = computeOwnerFinanceList(
    owners,
    vehicles,
    reservations
  );
  const history = computeFinancialHistory(
    reservations,
    vehicleLabels,
    vehicleOwners,
    ownerNames
  );
  const filterOptions = buildFilterOptions(vehicles, owners, reservations);

  let payouts: OwnerPayoutRecord[] = [];
  if (!payoutsRes.error && payoutsRes.data) {
    payouts = payoutsRes.data.map((payout) => ({
      ...payout,
      owner_name: ownerNames.get(payout.owner_id) ?? "Propriétaire",
      amount_due: Number(payout.amount_due),
      amount_paid: Number(payout.amount_paid),
      status: payout.status as "pending" | "paid",
    }));
  }

  return {
    stats,
    monthlyRevenues,
    monthlyCommissions,
    vehicleFinance,
    ownerFinance,
    history,
    payouts,
    filterOptions,
    reservations,
    vehicleOwners,
  };
}

export async function fetchOwnersForPayoutForm() {
  const supabase = await createClient();

  const { data: owners } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "owner")
    .order("last_name", { ascending: true });

  return (owners ?? []).map((owner) => ({
    id: owner.id,
    label: ownerDisplayName(owner),
  }));
}
