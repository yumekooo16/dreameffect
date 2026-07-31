import { createClient } from "@/src/lib/supabase/server";
import { getAuthUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Section from "@/src/components/owner/section";
import WelcomeCard from "@/src/components/owner/welcome-card";
import VehicleList from "@/src/components/owner/vehicle-list";
import DashboardSections from "@/src/components/owner/dashboard-sections";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import { fetchOwnerPortalVehicles } from "@/src/lib/owner/vehicles-data";

type ReservationRow = {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  customer_name?: string | null;
  status: string;
  owner_amount?: number | null;
  total_price?: number | null;
  distance_km?: number | null;
};

function computeStats(reservations: ReservationRow[]) {
  const finished = reservations.filter((r) => r.status === "finished");
  const totalRentals = finished.length;
  const ownerRevenue = finished.reduce(
    (sum, r) => sum + Number(r.owner_amount ?? r.total_price ?? 0),
    0
  );

  return {
    total_rentals: totalRentals,
    total_revenue: ownerRevenue,
    owner_revenue: ownerRevenue,
    rented_days: finished.reduce((sum, r) => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return (
        sum +
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      );
    }, 0),
    average_revenue: totalRentals ? Math.round(ownerRevenue / totalRentals) : 0,
  };
}

function countMonthlyRentals(reservations: ReservationRow[]) {
  const now = new Date();
  return reservations.filter((r) => {
    if (r.status === "cancelled") return false;
    const start = new Date(r.start_date);
    return (
      start.getMonth() === now.getMonth() &&
      start.getFullYear() === now.getFullYear()
    );
  }).length;
}

function findNextReservation(
  reservations: ReservationRow[],
  vehicles: { vehicle_id: string; brand: string; model: string }[]
) {
  const now = new Date();
  const upcoming = reservations
    .filter(
      (r) =>
        (r.status === "pending" || r.status === "confirmed") &&
        new Date(r.start_date) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

  if (!upcoming[0]) return null;

  const vehicle = vehicles.find((v) => v.vehicle_id === upcoming[0].vehicle_id);

  return {
    start_date: upcoming[0].start_date,
    end_date: upcoming[0].end_date,
    brand: vehicle?.brand,
    model: vehicle?.model,
  };
}

function SectionsSkeleton() {
  return (
    <div className="space-y-8">
      <ChartSkeleton />
      <div className="grid gap-8 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

async function DashboardData({
  vehicleIds,
  userId,
}: {
  vehicleIds: string[];
  userId: string;
}) {
  const supabase = await createClient();

  const [
    maintenancesRes,
    documentsRes,
    reservationsRes,
    monthlyRevenuesRes,
  ] = await Promise.all([
    supabase
      .from("maintenance")
      .select("id, title, type, description, mileage, maintenance_date, next_due_date")
      .in("vehicle_id", vehicleIds)
      .order("maintenance_date", { ascending: false })
      .limit(20),
    supabase
      .from("documents")
      .select("id, type, name, file_url, expiration_date, is_valid")
      .in("vehicle_id", vehicleIds),
    supabase
      .from("reservations")
      .select(
        "id, vehicle_id, start_date, end_date, customer_name, status, owner_amount, total_price, distance_km"
      )
      .in("vehicle_id", vehicleIds)
      .order("start_date", { ascending: false }),
    supabase
      .from("owner_monthly_revenue")
      .select("month, revenue")
      .eq("owner_id", userId)
      .order("month", { ascending: true }),
  ]);

  const reservations = reservationsRes.data ?? [];

  return (
    <DashboardSections
      reservations={reservations}
      maintenances={maintenancesRes.data ?? []}
      documents={documentsRes.data ?? []}
      stats={computeStats(reservations)}
      monthlyRevenues={monthlyRevenuesRes.data ?? []}
    />
  );
}

export default async function OwnerDashboard() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const [profileRes, vehicles, monthlyRevenueRes, latestNotifRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single(),
      fetchOwnerPortalVehicles(user.id),
      supabase
        .from("owner_current_month_revenue")
        .select("amount")
        .eq("owner_id", user.id)
        .maybeSingle(),
      supabase
        .from("notifications")
        .select("title, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (vehicles.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="de-empty">Aucun véhicule associé.</p>
      </div>
    );
  }

  const vehicleIds = vehicles.map((v) => v.vehicle_id);

  const { data: previewReservationsData } = await supabase
    .from("reservations")
    .select("id, vehicle_id, start_date, end_date, status")
    .in("vehicle_id", vehicleIds)
    .order("start_date", { ascending: false })
    .limit(20);

  const previewReservations = (previewReservationsData ?? []) as ReservationRow[];

  const totalRevenue = vehicles.reduce(
    (sum, v) => sum + Number(v.total_revenue ?? 0),
    0
  );

  const lastActivity = latestNotifRes.data
    ? {
        title: latestNotifRes.data.title,
        date: latestNotifRes.data.created_at,
      }
    : previewReservations[0]
      ? {
          title: "Activité récente",
          date: previewReservations[0].start_date,
        }
      : null;

  return (
    <div className="space-y-8">
      <WelcomeCard
        name={profileRes.data?.first_name ?? "Propriétaire"}
        vehicles={vehicles.map((v) => ({
          vehicle_id: v.vehicle_id,
          brand: v.brand,
          model: v.model,
          status: v.status,
        }))}
        monthlyRevenue={monthlyRevenueRes.data?.amount ?? 0}
        totalRevenue={totalRevenue}
        monthlyRentals={countMonthlyRentals(previewReservations)}
        nextReservation={findNextReservation(previewReservations, vehicles)}
        lastActivity={lastActivity}
      />

      <Section title="Ma flotte">
        <VehicleList vehicles={vehicles} />
      </Section>

      <Suspense fallback={<SectionsSkeleton />}>
        <DashboardData vehicleIds={vehicleIds} userId={user.id} />
      </Suspense>
    </div>
  );
}
