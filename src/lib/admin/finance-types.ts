import type { ReservationRow } from "@/src/lib/admin/dashboard-data";
import type { DashboardStats, MonthlyRevenue } from "@/src/lib/admin/dashboard-data";
import { computeVehicleRevenue } from "@/src/lib/admin/vehicles-types";
import { computeOwnerRevenue } from "@/src/lib/admin/owners-types";

export type { DashboardStats, MonthlyRevenue };

export type FinanceStats = DashboardStats & {
  yearlyRevenue: number;
};

export type MonthlyCommission = { month: string; commission: number };

export type VehicleFinanceItem = {
  vehicle_id: string;
  brand: string;
  model: string;
  image_url?: string | null;
  owner_id: string;
  owner_name: string;
  rental_count: number;
  total_revenue: number;
  owner_amount: number;
  company_amount: number;
  maintenance_cost: number;
  profitability: number;
};

export type OwnerFinanceItem = {
  owner_id: string;
  owner_name: string;
  vehicle_count: number;
  total_revenue: number;
  owner_amount: number;
  company_amount: number;
};

export type FinancialHistoryItem = {
  id: string;
  date: string;
  reservation_id: string;
  vehicle_id: string;
  vehicle_label: string;
  owner_id: string;
  owner_name: string;
  total_price: number;
  owner_amount: number;
  company_amount: number;
};

export type OwnerPayoutRecord = {
  id: string;
  owner_id: string;
  owner_name: string;
  amount_due: number;
  amount_paid: number;
  period_start: string;
  period_end: string;
  status: "pending" | "paid";
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type OwnerPayoutFormData = {
  owner_id: string;
  amount_due: number;
  amount_paid: number;
  period_start: string;
  period_end: string;
  status: "pending" | "paid";
  notes: string;
};

export type FinanceFilterOptions = {
  vehicles: { id: string; label: string }[];
  owners: { id: string; label: string }[];
  years: string[];
  months: { value: string; label: string }[];
};

function monthKey(dateStr: string) {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

function isCurrentYear(dateStr: string) {
  const date = new Date(dateStr);
  return date.getFullYear() === new Date().getFullYear();
}

function isCurrentMonth(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function computeStats(
  reservations: ReservationRow[],
  vehicles: { vehicle_id: string; total_revenue?: number | null; status: string }[]
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
    activeReservations: 0,
    upcomingReservations: 0,
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

export function computeFinanceStats(
  reservations: ReservationRow[],
  vehicles: { vehicle_id: string; total_revenue?: number | null; status: string }[]
): FinanceStats {
  const stats = computeStats(reservations, vehicles);
  const finished = reservations.filter((r) => r.status === "finished");
  const yearlyRevenue = finished
    .filter((r) => isCurrentYear(r.end_date))
    .reduce((sum, r) => sum + Number(r.total_price ?? 0), 0);

  return { ...stats, yearlyRevenue };
}

export function computeMonthlyCommissions(
  reservations: ReservationRow[]
): MonthlyCommission[] {
  const byMonth = new Map<string, number>();

  for (const reservation of reservations) {
    if (reservation.status !== "finished") continue;
    const key = monthKey(reservation.end_date);
    byMonth.set(
      key,
      (byMonth.get(key) ?? 0) + Number(reservation.company_amount ?? 0)
    );
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, commission]) => ({ month, commission }));
}

export function computeVehicleFinanceList(
  vehicles: {
    vehicle_id: string;
    brand: string;
    model: string;
    image_url?: string | null;
    owner_id: string;
    total_revenue?: number | null;
  }[],
  reservations: ReservationRow[],
  maintenanceCosts: Map<string, number>,
  ownerNames: Map<string, string>
): VehicleFinanceItem[] {
  return vehicles
    .map((vehicle) => {
      const vehicleReservations = reservations.filter(
        (r) => r.vehicle_id === vehicle.vehicle_id
      );
      const revenue = computeVehicleRevenue(
        vehicleReservations,
        Number(vehicle.total_revenue ?? 0)
      );
      const maintenanceCost =
        maintenanceCosts.get(vehicle.vehicle_id) ?? 0;

      return {
        vehicle_id: vehicle.vehicle_id,
        brand: vehicle.brand,
        model: vehicle.model,
        image_url: vehicle.image_url,
        owner_id: vehicle.owner_id,
        owner_name: ownerNames.get(vehicle.owner_id) ?? "Propriétaire",
        rental_count: revenue.rentalCount,
        total_revenue: revenue.totalRevenue,
        owner_amount: revenue.ownerShare,
        company_amount: revenue.companyShare,
        maintenance_cost: maintenanceCost,
        profitability: revenue.totalRevenue - maintenanceCost,
      };
    })
    .sort((a, b) => b.total_revenue - a.total_revenue);
}

export function computeOwnerFinanceList(
  owners: { id: string; first_name: string | null; last_name: string | null }[],
  vehicles: { vehicle_id: string; owner_id: string }[],
  reservations: ReservationRow[]
): OwnerFinanceItem[] {
  const ownerNames = new Map<string, string>();
  for (const owner of owners) {
    const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
    ownerNames.set(owner.id, name || "Propriétaire");
  }

  const vehicleCountByOwner = new Map<string, number>();
  for (const vehicle of vehicles) {
    vehicleCountByOwner.set(
      vehicle.owner_id,
      (vehicleCountByOwner.get(vehicle.owner_id) ?? 0) + 1
    );
  }

  const reservationsByOwner = new Map<string, ReservationRow[]>();
  const vehicleOwnerMap = new Map(
    vehicles.map((v) => [v.vehicle_id, v.owner_id])
  );

  for (const reservation of reservations) {
    const ownerId = vehicleOwnerMap.get(reservation.vehicle_id);
    if (!ownerId) continue;
    const list = reservationsByOwner.get(ownerId) ?? [];
    list.push(reservation);
    reservationsByOwner.set(ownerId, list);
  }

  const ownerIds = new Set([
    ...owners.map((o) => o.id),
    ...vehicles.map((v) => v.owner_id),
  ]);

  return Array.from(ownerIds)
    .map((ownerId) => {
      const ownerReservations = reservationsByOwner.get(ownerId) ?? [];
      const revenue = computeOwnerRevenue(ownerReservations);

      return {
        owner_id: ownerId,
        owner_name: ownerNames.get(ownerId) ?? "Propriétaire",
        vehicle_count: vehicleCountByOwner.get(ownerId) ?? 0,
        total_revenue: revenue.totalRevenue,
        owner_amount: revenue.ownerShare,
        company_amount: revenue.companyShare,
      };
    })
    .filter((o) => o.vehicle_count > 0 || o.total_revenue > 0)
    .sort((a, b) => b.total_revenue - a.total_revenue);
}

export function computeFinancialHistory(
  reservations: ReservationRow[],
  vehicleLabels: Map<string, string>,
  vehicleOwners: Map<string, string>,
  ownerNames: Map<string, string>
): FinancialHistoryItem[] {
  return reservations
    .filter((r) => r.status === "finished")
    .map((reservation) => ({
      id: reservation.id,
      date: reservation.end_date,
      reservation_id: reservation.id,
      vehicle_id: reservation.vehicle_id,
      vehicle_label:
        vehicleLabels.get(reservation.vehicle_id) ?? "Véhicule inconnu",
      owner_id: vehicleOwners.get(reservation.vehicle_id) ?? "",
      owner_name:
        ownerNames.get(
          vehicleOwners.get(reservation.vehicle_id) ?? ""
        ) ?? "Propriétaire",
      total_price: Number(reservation.total_price ?? 0),
      owner_amount: Number(reservation.owner_amount ?? 0),
      company_amount: Number(reservation.company_amount ?? 0),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function filterFinishedReservations(
  reservations: ReservationRow[],
  filters: {
    vehicleId?: string;
    ownerId?: string;
    month?: string;
    year?: string;
    periodStart?: string;
    periodEnd?: string;
  },
  vehicleOwners: Map<string, string>
): ReservationRow[] {
  return reservations.filter((reservation) => {
    if (reservation.status !== "finished") return false;

    if (filters.vehicleId && reservation.vehicle_id !== filters.vehicleId) {
      return false;
    }

    if (filters.ownerId) {
      const ownerId = vehicleOwners.get(reservation.vehicle_id);
      if (ownerId !== filters.ownerId) return false;
    }

    const endDate = new Date(reservation.end_date);

    if (filters.year && endDate.getFullYear() !== Number(filters.year)) {
      return false;
    }

    if (filters.month) {
      const [year, month] = filters.month.split("-");
      if (
        endDate.getFullYear() !== Number(year) ||
        endDate.getMonth() + 1 !== Number(month)
      ) {
        return false;
      }
    }

    if (filters.periodStart) {
      const start = new Date(filters.periodStart);
      start.setHours(0, 0, 0, 0);
      if (endDate < start) return false;
    }

    if (filters.periodEnd) {
      const end = new Date(filters.periodEnd);
      end.setHours(23, 59, 59, 999);
      if (endDate > end) return false;
    }

    return true;
  });
}

export function buildFilterOptions(
  vehicles: { vehicle_id: string; brand: string; model: string; owner_id: string }[],
  owners: { id: string; first_name: string | null; last_name: string | null }[],
  reservations: ReservationRow[]
): FinanceFilterOptions {
  const ownerNames = new Map<string, string>();
  for (const owner of owners) {
    const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
    ownerNames.set(owner.id, name || "Propriétaire");
  }

  const years = new Set<string>();
  const months = new Set<string>();

  for (const reservation of reservations) {
    if (reservation.status !== "finished") continue;
    const date = new Date(reservation.end_date);
    years.add(String(date.getFullYear()));
    const month = String(date.getMonth() + 1).padStart(2, "0");
    months.add(`${date.getFullYear()}-${month}`);
  }

  const sortedYears = Array.from(years).sort((a, b) => Number(b) - Number(a));
  const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));

  return {
    vehicles: vehicles.map((v) => ({
      id: v.vehicle_id,
      label: `${v.brand} ${v.model}`,
    })),
    owners: owners.map((o) => ({
      id: o.id,
      label: ownerNames.get(o.id) ?? "Propriétaire",
    })),
    years: sortedYears,
    months: sortedMonths.map((m) => {
      const [year, month] = m.split("-");
      const label = new Date(`${year}-${month}-01`).toLocaleDateString(
        "fr-FR",
        { month: "long", year: "numeric" }
      );
      return { value: m, label };
    }),
  };
}
