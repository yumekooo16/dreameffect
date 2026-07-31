import {
  getMaintenanceDueStatus,
  type MaintenanceType,
} from "@/src/lib/maintenance/type";

export type MaintenanceRecord = {
  id: string;
  vehicle_id: string;
  title: string;
  type: MaintenanceType | string;
  description?: string | null;
  mileage?: number | null;
  maintenance_date?: string | null;
  next_due_date?: string | null;
  cost?: number | null;
  provider?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
};

export type MaintenanceListItem = MaintenanceRecord & {
  vehicle_label: string;
  vehicle_image_url?: string | null;
  vehicle_mileage: number;
  owner_id: string;
  owner_name: string;
};

export type MaintenanceDetail = MaintenanceListItem & {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    image_url?: string | null;
    mileage: number;
    owner_id: string;
  };
  owner: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
};

export type MaintenanceStats = {
  upcomingDue: number;
  recentCount: number;
  vehiclesNeedingIntervention: number;
  monthlyCost: number;
  totalCost: number;
  overdueCount: number;
  dueSoonCount: number;
};

export type MaintenanceCostByVehicle = {
  vehicle_id: string;
  vehicle_label: string;
  total_cost: number;
  intervention_count: number;
};

export type MaintenanceCostByMonth = {
  month: string;
  total_cost: number;
  intervention_count: number;
};

export type MaintenanceFormData = {
  vehicle_id: string;
  type: MaintenanceType;
  title: string;
  description: string;
  mileage: number;
  maintenance_date: string;
  next_due_date: string;
  cost: number;
  provider: string;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
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

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const RECENT_DAYS = 30;

export function computeMaintenanceStats(
  items: MaintenanceListItem[]
): MaintenanceStats {
  const today = startOfDay(new Date());
  const recentThreshold = new Date(
    today.getTime() - RECENT_DAYS * MS_PER_DAY
  );

  const vehicleIdsNeeding = new Set<string>();

  let upcomingDue = 0;
  let overdueCount = 0;
  let dueSoonCount = 0;
  let recentCount = 0;
  let monthlyCost = 0;
  let totalCost = 0;

  for (const item of items) {
    totalCost += Number(item.cost ?? 0);

    if (item.maintenance_date && isCurrentMonth(item.maintenance_date)) {
      monthlyCost += Number(item.cost ?? 0);
    }

    if (item.maintenance_date) {
      const date = startOfDay(new Date(item.maintenance_date));
      if (date >= recentThreshold) {
        recentCount += 1;
      }
    }

    const dueStatus = getMaintenanceDueStatus(item.next_due_date);

    if (dueStatus === "overdue") {
      overdueCount += 1;
      vehicleIdsNeeding.add(item.vehicle_id);
    } else if (dueStatus === "due_soon") {
      dueSoonCount += 1;
      upcomingDue += 1;
      vehicleIdsNeeding.add(item.vehicle_id);
    } else if (dueStatus === "scheduled") {
      upcomingDue += 1;
    }
  }

  return {
    upcomingDue,
    recentCount,
    vehiclesNeedingIntervention: vehicleIdsNeeding.size,
    monthlyCost,
    totalCost,
    overdueCount,
    dueSoonCount,
  };
}

export function computeCostByVehicle(
  items: MaintenanceListItem[]
): MaintenanceCostByVehicle[] {
  const byVehicle = new Map<
    string,
    { vehicle_label: string; total_cost: number; intervention_count: number }
  >();

  for (const item of items) {
    const existing = byVehicle.get(item.vehicle_id) ?? {
      vehicle_label: item.vehicle_label,
      total_cost: 0,
      intervention_count: 0,
    };

    byVehicle.set(item.vehicle_id, {
      vehicle_label: item.vehicle_label,
      total_cost: existing.total_cost + Number(item.cost ?? 0),
      intervention_count: existing.intervention_count + 1,
    });
  }

  return Array.from(byVehicle.entries())
    .map(([vehicle_id, data]) => ({ vehicle_id, ...data }))
    .sort((a, b) => b.total_cost - a.total_cost);
}

export function computeCostByMonth(
  items: MaintenanceListItem[]
): MaintenanceCostByMonth[] {
  const byMonth = new Map<
    string,
    { total_cost: number; intervention_count: number }
  >();

  for (const item of items) {
    if (!item.maintenance_date) continue;
    const key = monthKey(item.maintenance_date);
    const existing = byMonth.get(key) ?? {
      total_cost: 0,
      intervention_count: 0,
    };

    byMonth.set(key, {
      total_cost: existing.total_cost + Number(item.cost ?? 0),
      intervention_count: existing.intervention_count + 1,
    });
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

export function splitDueItems(items: MaintenanceListItem[]) {
  const overdue: MaintenanceListItem[] = [];
  const dueSoon: MaintenanceListItem[] = [];

  for (const item of items) {
    const status = getMaintenanceDueStatus(item.next_due_date);
    if (status === "overdue") overdue.push(item);
    else if (status === "due_soon") dueSoon.push(item);
  }

  overdue.sort((a, b) =>
    (a.next_due_date ?? "").localeCompare(b.next_due_date ?? "")
  );
  dueSoon.sort((a, b) =>
    (a.next_due_date ?? "").localeCompare(b.next_due_date ?? "")
  );

  return { overdue, dueSoon };
}
