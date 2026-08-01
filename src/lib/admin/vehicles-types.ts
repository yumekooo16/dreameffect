import type { ReservationRow } from "@/src/lib/admin/dashboard-data";

export type VehicleRow = {
  id: string;
  owner_id: string;
  brand: string;
  model: string;
  version?: string | null;
  year?: number | null;
  plate?: string | null;
  vin?: string | null;
  color?: string | null;
  mileage: number;
  status: string;
  image_url?: string | null;
  hero_image_url?: string | null;
  public_image_url?: string | null;
  daily_rate?: number | null;
  price_24h_weekday?: number | null;
  price_24h_weekend?: number | null;
  price_48h_weekend?: number | null;
  price_72h_weekend?: number | null;
  price_7_days?: number | null;
  deposit?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  power?: number | null;
  location?: string | null;
  description?: string | null;
  slug?: string | null;
  is_published?: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type VehicleImageRow = {
  id: string;
  vehicle_id: string;
  image_url: string;
  is_primary: boolean;
  created_at?: string | null;
};

export type VehicleListItem = {
  id: string;
  brand: string;
  model: string;
  year?: number | null;
  mileage: number;
  status: string;
  image_url?: string | null;
  created_at: string;
  owner_id: string;
  owner_name: string;
  total_revenue: number;
};

export type VehicleMaintenanceRow = {
  id: string;
  vehicle_id: string;
  title: string;
  type: string;
  description?: string | null;
  mileage?: number | null;
  maintenance_date?: string | null;
  next_due_date?: string | null;
  cost?: number | null;
  provider?: string | null;
};

export type VehicleDocumentRow = {
  id: string;
  type: string;
  name: string;
  file_url: string;
  expiration_date?: string | null;
  is_valid?: boolean | null;
};

export type VehicleRevenueStats = {
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
  rentalCount: number;
  monthlyRevenues: { month: string; revenue: number }[];
};

export type VehicleDetail = {
  vehicle: VehicleRow;
  owner: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
  dashboard: {
    total_revenue: number;
    total_rentals: number;
  };
  images: VehicleImageRow[];
  reservations: ReservationRow[];
  maintenances: VehicleMaintenanceRow[];
  documents: VehicleDocumentRow[];
  revenue: VehicleRevenueStats;
};

export function computeVehicleRevenue(
  reservations: ReservationRow[],
  fallbackTotal?: number
): VehicleRevenueStats {
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
    totalRevenue: fallbackTotal ?? totalRevenue,
    ownerShare,
    companyShare,
    rentalCount: finished.length,
    monthlyRevenues,
  };
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function splitReservations(reservations: ReservationRow[]) {
  const now = startOfDay(new Date());
  const past: ReservationRow[] = [];
  const current: ReservationRow[] = [];
  const upcoming: ReservationRow[] = [];

  for (const reservation of reservations) {
    const start = startOfDay(new Date(reservation.start_date));
    const end = startOfDay(new Date(reservation.end_date));

    if (
      (reservation.status === "pending" || reservation.status === "confirmed") &&
      start <= now &&
      end >= now
    ) {
      current.push(reservation);
    } else if (
      (reservation.status === "pending" || reservation.status === "confirmed") &&
      start > now
    ) {
      upcoming.push(reservation);
    } else {
      past.push(reservation);
    }
  }

  return { past, current, upcoming };
}
