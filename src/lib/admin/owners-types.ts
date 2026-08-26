import type { ReservationRow } from "@/src/lib/admin/dashboard-data";
import type { RevenueMode } from "@/src/lib/revenue/split";

export type OwnerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email?: string | null;
  role: string;
  created_at?: string | null;
  revenue_mode?: RevenueMode | null;
  owner_revenue_share?: number | null;
};

export type OwnerFormData = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  revenue_mode: RevenueMode;
  /** Pourcentage 0–100 si mode percentage. Défaut 60. */
  owner_revenue_share_percent: number;
};

export type OwnerListItem = OwnerProfile & {
  vehicleCount: number;
  reservationCount: number;
  totalRevenue: number;
  isActive: boolean;
  emailConfirmed: boolean;
};

export type OwnerVehicle = {
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

export type OwnerReservation = ReservationRow & {
  customer_email?: string | null;
  vehicleLabel: string;
};

export type OwnerRevenueStats = {
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
  monthlyRevenues: { month: string; revenue: number }[];
};

export function computeOwnerRevenue(
  reservations: ReservationRow[]
): OwnerRevenueStats {
  const finished = reservations.filter((r) => r.status === "finished");

  const totalRevenue = finished.reduce(
    (sum, r) => sum + Number(r.total_price ?? 0),
    0
  );

  const ownerShare = finished.reduce(
    (sum, r) => sum + Number(r.owner_amount ?? 0),
    0
  );

  const companyShare = finished.reduce(
    (sum, r) => sum + Number(r.company_amount ?? 0),
    0
  );

  const byMonth = new Map<string, number>();

  for (const reservation of finished) {
    const date = new Date(reservation.end_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    byMonth.set(
      key,
      (byMonth.get(key) ?? 0) + Number(reservation.total_price ?? 0)
    );
  }

  const monthlyRevenues = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  return {
    totalRevenue,
    ownerShare,
    companyShare,
    monthlyRevenues,
  };
}
