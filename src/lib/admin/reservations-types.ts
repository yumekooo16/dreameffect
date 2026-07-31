import type { ReservationRow } from "@/src/lib/admin/dashboard-data";

export type ReservationRecord = ReservationRow & {
  customer_email?: string | null;
  pickup_location?: string | null;
  return_location?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ReservationListItem = ReservationRecord & {
  vehicle_label: string;
  vehicle_image_url?: string | null;
  owner_id: string;
  owner_name: string;
};

export type ReservationDetail = ReservationListItem & {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    image_url?: string | null;
    owner_id: string;
  };
  owner: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
  client_history: {
    total_reservations: number;
    finished_reservations: number;
    total_spent: number;
  };
};

export type ReservationStats = {
  upcoming: number;
  current: number;
  finished: number;
  cancelled: number;
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
};

export type ReservationFormData = {
  vehicle_id: string;
  customer_name: string;
  customer_email: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  return_location: string;
  total_price: number;
  owner_amount: number;
  company_amount: number;
  distance_km: number | null;
  status: "pending" | "confirmed" | "finished" | "cancelled";
};

export function formatDistanceKm(distance?: number | null) {
  if (distance == null) return "—";
  return `${distance.toLocaleString("fr-FR")} km`;
}

export function computeReservationStats(
  reservations: ReservationRecord[]
): ReservationStats {
  const finished = reservations.filter((r) => r.status === "finished");
  const cancelled = reservations.filter((r) => r.status === "cancelled");

  return {
    upcoming: reservations.filter(
      (r) =>
        (r.status === "pending" || r.status === "confirmed") &&
        new Date(r.start_date) > new Date()
    ).length,
    current: reservations.filter((r) => {
      const now = new Date();
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return (
        (r.status === "pending" || r.status === "confirmed") &&
        start <= now &&
        end >= now
      );
    }).length,
    finished: finished.length,
    cancelled: cancelled.length,
    totalRevenue: finished.reduce(
      (sum, r) => sum + Number(r.total_price ?? 0),
      0
    ),
    ownerShare: finished.reduce(
      (sum, r) => sum + Number(r.owner_amount ?? 0),
      0
    ),
    companyShare: finished.reduce(
      (sum, r) => sum + Number(r.company_amount ?? 0),
      0
    ),
  };
}
