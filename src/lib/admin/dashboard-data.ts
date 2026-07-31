import { createClient } from "@/src/lib/supabase/server";
import {
  computeOwnerFinanceList,
  computeVehicleFinanceList,
} from "@/src/lib/admin/finance-types";

export type ReservationRow = {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  customer_name?: string | null;
  status: string;
  owner_amount?: number | null;
  company_amount?: number | null;
  total_price?: number | null;
  distance_km?: number | null;
};

export type VehicleRow = {
  vehicle_id: string;
  brand: string;
  model: string;
  status: string;
  total_revenue?: number | null;
  owner_id: string;
};

export type MaintenanceRow = {
  id: string;
  vehicle_id: string;
  title: string;
  type: string;
  maintenance_date?: string | null;
  next_due_date?: string | null;
  cost?: number | null;
};

export type DocumentRow = {
  id: string;
  vehicle_id: string;
  type: string;
  name: string;
  expiration_date?: string | null;
  is_valid?: boolean | null;
};

export type ActivityEvent = {
  id: string;
  type:
    | "reservation_new"
    | "reservation_finished"
    | "maintenance"
    | "document";
  title: string;
  description?: string;
  date: string;
};

export type AlertItem = {
  id: string;
  type: "vehicle_unavailable" | "reservation_today" | "document_expiring" | "maintenance_due";
  title: string;
  description?: string;
  priority: "high" | "medium";
  href?: string;
};

export type DashboardInsights = {
  occupancyRate: number;
  totalMaintenanceCost: number;
  estimatedProfitability: number;
  finishedRentals: number;
  topVehicles: {
    vehicle_id: string;
    brand: string;
    model: string;
    total_revenue: number;
    maintenance_cost: number;
    profitability: number;
  }[];
  topOwners: {
    owner_id: string;
    owner_name: string;
    vehicle_count: number;
    total_revenue: number;
  }[];
};

export type DashboardStats = {
  ownersCount: number;
  vehiclesCount: number;
  availableVehicles: number;
  rentedVehicles: number;
  activeReservations: number;
  upcomingReservations: number;
  monthlyRevenue: number;
  totalRevenue: number;
  monthlyCommission: number;
  totalCommission: number;
  ownerRevenue: number;
  ownerMonthlyRevenue: number;
};

export type MonthlyRevenue = { month: string; revenue: number };
export type MonthlyReservationCount = { month: string; count: number };

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function isActiveReservation(reservation: ReservationRow) {
  if (reservation.status !== "pending" && reservation.status !== "confirmed") {
    return false;
  }
  const now = startOfDay(new Date());
  const start = startOfDay(new Date(reservation.start_date));
  const end = startOfDay(new Date(reservation.end_date));
  return start <= now && end >= now;
}

function isUpcomingReservation(reservation: ReservationRow) {
  if (reservation.status !== "pending" && reservation.status !== "confirmed") {
    return false;
  }
  const now = startOfDay(new Date());
  const start = startOfDay(new Date(reservation.start_date));
  return start > now;
}

function isCurrentMonth(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function monthKey(dateStr: string) {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

export function computeStats(
  reservations: ReservationRow[],
  vehicles: VehicleRow[]
): DashboardStats {
  const finished = reservations.filter((r) => r.status === "finished");
  const monthlyFinished = finished.filter((r) => isCurrentMonth(r.end_date));

  const totalRevenue = vehicles.reduce(
    (sum, v) => sum + Number(v.total_revenue ?? 0),
    0
  );

  const totalCommission = finished.reduce(
    (sum, r) => sum + Number(r.company_amount ?? 0),
    0
  );

  const monthlyRevenue = monthlyFinished.reduce(
    (sum, r) => sum + Number(r.total_price ?? 0),
    0
  );

  const monthlyCommission = monthlyFinished.reduce(
    (sum, r) => sum + Number(r.company_amount ?? 0),
    0
  );

  const ownerRevenue = finished.reduce(
    (sum, r) => sum + Number(r.owner_amount ?? 0),
    0
  );

  const ownerMonthlyRevenue = monthlyFinished.reduce(
    (sum, r) => sum + Number(r.owner_amount ?? 0),
    0
  );

  return {
    ownersCount: 0,
    vehiclesCount: vehicles.length,
    availableVehicles: vehicles.filter((v) => v.status === "available").length,
    rentedVehicles: vehicles.filter((v) => v.status !== "available").length,
    activeReservations: reservations.filter(isActiveReservation).length,
    upcomingReservations: reservations.filter(isUpcomingReservation).length,
    monthlyRevenue,
    totalRevenue,
    monthlyCommission,
    totalCommission,
    ownerRevenue,
    ownerMonthlyRevenue,
  };
}

export function computeMonthlyRevenues(
  reservations: ReservationRow[]
): MonthlyRevenue[] {
  const byMonth = new Map<string, number>();

  for (const reservation of reservations) {
    if (reservation.status !== "finished") continue;
    const key = monthKey(reservation.end_date);
    byMonth.set(
      key,
      (byMonth.get(key) ?? 0) + Number(reservation.total_price ?? 0)
    );
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}

export function computeMonthlyReservationCounts(
  reservations: ReservationRow[]
): MonthlyReservationCount[] {
  const byMonth = new Map<string, number>();

  for (const reservation of reservations) {
    if (reservation.status === "cancelled") continue;
    const key = monthKey(reservation.start_date);
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export function buildActivityFeed(
  reservations: ReservationRow[],
  maintenances: MaintenanceRow[],
  documents: DocumentRow[],
  vehicles: VehicleRow[]
): ActivityEvent[] {
  const vehicleMap = new Map(
    vehicles.map((v) => [v.vehicle_id, `${v.brand} ${v.model}`])
  );

  const events: ActivityEvent[] = [];

  for (const reservation of reservations) {
    const vehicleLabel = vehicleMap.get(reservation.vehicle_id) ?? "Véhicule";
    const customer = reservation.customer_name ?? "Client";

    if (reservation.status === "finished") {
      events.push({
        id: `res-finished-${reservation.id}`,
        type: "reservation_finished",
        title: "Réservation terminée",
        description: `${vehicleLabel} — ${customer}`,
        date: reservation.end_date,
      });
    } else if (
      reservation.status === "pending" ||
      reservation.status === "confirmed"
    ) {
      events.push({
        id: `res-new-${reservation.id}`,
        type: "reservation_new",
        title: "Nouvelle réservation",
        description: `${vehicleLabel} — ${customer}`,
        date: reservation.start_date,
      });
    }
  }

  for (const maintenance of maintenances) {
    if (!maintenance.maintenance_date) continue;
    const vehicleLabel =
      vehicleMap.get(maintenance.vehicle_id) ?? "Véhicule";
    events.push({
      id: `maint-${maintenance.id}`,
      type: "maintenance",
      title: "Entretien effectué",
      description: `${maintenance.title} — ${vehicleLabel}`,
      date: maintenance.maintenance_date,
    });
  }

  for (const document of documents) {
    if (!document.expiration_date) continue;
    const vehicleLabel = vehicleMap.get(document.vehicle_id) ?? "Véhicule";
    events.push({
      id: `doc-${document.id}`,
      type: "document",
      title: "Document enregistré",
      description: `${document.name} — ${vehicleLabel}`,
      date: document.expiration_date,
    });
  }

  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);
}

export function buildAlerts(
  vehicles: VehicleRow[],
  reservations: ReservationRow[],
  documents: DocumentRow[],
  maintenances: MaintenanceRow[]
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const today = startOfDay(new Date());
  const in30Days = new Date(today.getTime() + 30 * MS_PER_DAY);

  for (const vehicle of vehicles) {
    if (vehicle.status !== "available") {
      alerts.push({
        id: `vehicle-${vehicle.vehicle_id}`,
        type: "vehicle_unavailable",
        title: `${vehicle.brand} ${vehicle.model} indisponible`,
        description: "Le véhicule n'est pas disponible à la location",
        priority: "medium",
        href: `/admin/vehicules/${vehicle.vehicle_id}`,
      });
    }
  }

  for (const reservation of reservations) {
    if (reservation.status !== "pending" && reservation.status !== "confirmed") {
      continue;
    }
    const start = startOfDay(new Date(reservation.start_date));
    if (isSameDay(start, today)) {
      const vehicle = vehicles.find((v) => v.vehicle_id === reservation.vehicle_id);
      alerts.push({
        id: `res-today-${reservation.id}`,
        type: "reservation_today",
        title: "Réservation commence aujourd'hui",
        description: vehicle
          ? `${vehicle.brand} ${vehicle.model}${reservation.customer_name ? ` — ${reservation.customer_name}` : ""}`
          : reservation.customer_name ?? undefined,
        priority: "high",
        href: `/admin/reservations/${reservation.id}`,
      });
    }
  }

  for (const document of documents) {
    if (!document.expiration_date || document.is_valid === false) continue;
    const expiration = startOfDay(new Date(document.expiration_date));
    if (expiration >= today && expiration <= in30Days) {
      alerts.push({
        id: `doc-exp-${document.id}`,
        type: "document_expiring",
        title: "Document bientôt expiré",
        description: `${document.name} — expire le ${expiration.toLocaleDateString("fr-FR")}`,
        priority: "medium",
        href: `/admin/documents/${document.id}`,
      });
    }
  }

  for (const maintenance of maintenances) {
    if (!maintenance.next_due_date) continue;
    const due = startOfDay(new Date(maintenance.next_due_date));
    if (due >= today && due <= in30Days) {
      const vehicle = vehicles.find((v) => v.vehicle_id === maintenance.vehicle_id);
      alerts.push({
        id: `maint-due-${maintenance.id}`,
        type: "maintenance_due",
        title: "Entretien prévu prochainement",
        description: vehicle
          ? `${maintenance.title} — ${vehicle.brand} ${vehicle.model}`
          : maintenance.title,
        priority: "medium",
        href: `/admin/maintenance/${maintenance.id}`,
      });
    }
  }

  const priorityOrder = { high: 0, medium: 1 };
  return alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function computeDashboardInsights(
  reservations: ReservationRow[],
  vehicles: VehicleRow[],
  maintenances: MaintenanceRow[],
  owners: { id: string; first_name: string | null; last_name: string | null }[]
): DashboardInsights {
  const finished = reservations.filter((r) => r.status === "finished");
  const maintenanceCosts = new Map<string, number>();

  for (const item of maintenances) {
    maintenanceCosts.set(
      item.vehicle_id,
      (maintenanceCosts.get(item.vehicle_id) ?? 0) + Number(item.cost ?? 0)
    );
  }

  const ownerNames = new Map<string, string>();
  for (const owner of owners) {
    const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
    ownerNames.set(owner.id, name || "Propriétaire");
  }

  const vehicleFinance = computeVehicleFinanceList(
    vehicles,
    finished,
    maintenanceCosts,
    ownerNames
  );

  const ownerFinance = computeOwnerFinanceList(
    owners,
    vehicles.map((v) => ({ vehicle_id: v.vehicle_id, owner_id: v.owner_id })),
    finished
  );

  const totalMaintenanceCost = maintenances.reduce(
    (sum, item) => sum + Number(item.cost ?? 0),
    0
  );

  const finishedRevenue = finished.reduce(
    (sum, r) => sum + Number(r.total_price ?? 0),
    0
  );

  const occupancyRate =
    vehicles.length > 0
      ? Math.round(
          (vehicles.filter((v) => v.status !== "available").length /
            vehicles.length) *
            100
        )
      : 0;

  return {
    occupancyRate,
    totalMaintenanceCost,
    estimatedProfitability: finishedRevenue - totalMaintenanceCost,
    finishedRentals: finished.length,
    topVehicles: vehicleFinance.slice(0, 5).map((vehicle) => ({
      vehicle_id: vehicle.vehicle_id,
      brand: vehicle.brand,
      model: vehicle.model,
      total_revenue: vehicle.total_revenue,
      maintenance_cost: vehicle.maintenance_cost,
      profitability: vehicle.profitability,
    })),
    topOwners: ownerFinance.slice(0, 5).map((owner) => ({
      owner_id: owner.owner_id,
      owner_name: owner.owner_name,
      vehicle_count: owner.vehicle_count,
      total_revenue: owner.total_revenue,
    })),
  };
}

export async function fetchAdminDashboardData() {
  const supabase = await createClient();

  const [
    ownersRes,
    vehiclesRes,
    reservationsRes,
    maintenancesRes,
    documentsRes,
    ownerProfilesRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner"),
    supabase
      .from("owner_vehicle_dashboard")
      .select("vehicle_id, brand, model, status, total_revenue, owner_id"),
    supabase
      .from("reservations")
      .select(
        "id, vehicle_id, start_date, end_date, customer_name, status, owner_amount, company_amount, total_price, distance_km"
      )
      .order("start_date", { ascending: false })
      .limit(500),
    supabase
      .from("maintenance")
      .select("id, vehicle_id, title, type, maintenance_date, next_due_date, cost")
      .order("maintenance_date", { ascending: false })
      .limit(200),
    supabase
      .from("documents")
      .select("id, vehicle_id, type, name, expiration_date, is_valid"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "owner"),
  ]);

  const vehicles = (vehiclesRes.data ?? []) as VehicleRow[];
  const reservations = (reservationsRes.data ?? []) as ReservationRow[];
  const maintenances = (maintenancesRes.data ?? []) as MaintenanceRow[];
  const documents = (documentsRes.data ?? []) as DocumentRow[];

  const stats = computeStats(reservations, vehicles);
  stats.ownersCount = ownersRes.count ?? 0;

  return {
    stats,
    insights: computeDashboardInsights(
      reservations,
      vehicles,
      maintenances,
      ownerProfilesRes.data ?? []
    ),
    monthlyRevenues: computeMonthlyRevenues(reservations),
    monthlyReservationCounts: computeMonthlyReservationCounts(reservations),
    activity: buildActivityFeed(reservations, maintenances, documents, vehicles),
    alerts: buildAlerts(vehicles, reservations, documents, maintenances),
  };
}
