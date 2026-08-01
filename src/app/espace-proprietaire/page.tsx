import { createClient } from "@/src/lib/supabase/server";
import { getAuthUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Section from "@/src/components/owner/section";
import VehicleHero from "@/src/components/owner/vehicle-hero";
import RevenueSplitCard from "@/src/components/owner/revenue-split-card";
import DailyRevenueFeed from "@/src/components/owner/daily-revenue-feed";
import VehicleList from "@/src/components/owner/vehicle-list";
import DashboardSections from "@/src/components/owner/dashboard-sections";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import {
  fetchOwnerPortalVehicles,
  type OwnerPortalVehicle,
} from "@/src/lib/owner/vehicles-data";
import {
  computeRevenueSummaryWithLedger,
  fetchLedgerForReservations,
  resolveReservationSplit,
} from "@/src/lib/revenue/daily-ledger";

type ReservationRow = {
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

function pickPrimaryVehicle(vehicles: OwnerPortalVehicle[]) {
  if (vehicles.length === 0) return null;
  if (vehicles.length === 1) return vehicles[0];

  return [...vehicles].sort(
    (a, b) => Number(b.total_revenue ?? 0) - Number(a.total_revenue ?? 0)
  )[0];
}

function countVehicleReservations(
  reservations: ReservationRow[],
  vehicleId: string
) {
  return reservations.filter(
    (reservation) =>
      reservation.vehicle_id === vehicleId &&
      reservation.status !== "cancelled"
  ).length;
}

function computeVehicleMonthlyRevenue(
  reservations: ReservationRow[],
  vehicleId: string
) {
  const now = new Date();

  return reservations
    .filter((reservation) => {
      if (reservation.vehicle_id !== vehicleId) return false;
      if (reservation.status !== "finished") return false;
      const start = new Date(reservation.start_date);
      return (
        start.getMonth() === now.getMonth() &&
        start.getFullYear() === now.getFullYear()
      );
    })
    .reduce(
      (sum, reservation) =>
        sum + resolveReservationSplit(reservation).ownerAmount,
      0
    );
}

function findVehicleNextReservation(
  reservations: ReservationRow[],
  vehicleId: string
) {
  const now = new Date();
  const upcoming = reservations
    .filter(
      (reservation) =>
        reservation.vehicle_id === vehicleId &&
        (reservation.status === "pending" || reservation.status === "confirmed") &&
        new Date(reservation.start_date) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

  if (!upcoming[0]) return null;

  return {
    start_date: upcoming[0].start_date,
    end_date: upcoming[0].end_date,
  };
}

function computeStats(
  reservations: ReservationRow[],
  ledgerByReservation: Awaited<ReturnType<typeof fetchLedgerForReservations>>
) {
  const finished = reservations.filter((r) => r.status === "finished");
  const summary = computeRevenueSummaryWithLedger(
    reservations.filter((r) => r.status !== "cancelled"),
    ledgerByReservation
  );
  const totalRentals = summary.rentalCount;

  return {
    total_rentals: totalRentals,
    total_revenue: summary.totalRevenue,
    owner_revenue: summary.ownerShare,
    company_revenue: summary.companyShare,
    rented_days: finished.reduce((sum, r) => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return (
        sum +
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      );
    }, 0),
    average_revenue: summary.rentalCount
      ? Math.round(summary.ownerShare / summary.rentalCount)
      : 0,
  };
}

function currentMonthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
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
  ledgerByReservation,
}: {
  vehicleIds: string[];
  userId: string;
  ledgerByReservation: Awaited<ReturnType<typeof fetchLedgerForReservations>>;
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
      stats={computeStats(reservations as ReservationRow[], ledgerByReservation)}
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

  const [profileRes, vehicles, monthlyRevenueRes] = await Promise.all([
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
    .select(
      "id, vehicle_id, start_date, end_date, status, owner_amount, company_amount, total_price"
    )
    .in("vehicle_id", vehicleIds)
    .order("start_date", { ascending: false });

  const previewReservations = (previewReservationsData ?? []) as ReservationRow[];
  const primaryVehicle = pickPrimaryVehicle(vehicles);
  const reservationIds = previewReservations.map((reservation) => reservation.id);
  const ledgerByReservation = await fetchLedgerForReservations(
    supabase,
    reservationIds
  );
  const fleetRevenue = computeRevenueSummaryWithLedger(
    previewReservations,
    ledgerByReservation
  );
  const primaryReservations = primaryVehicle
    ? previewReservations.filter(
        (reservation) => reservation.vehicle_id === primaryVehicle.vehicle_id
      )
    : [];
  const primaryRevenue = computeRevenueSummaryWithLedger(
    primaryReservations,
    ledgerByReservation
  );

  const monthBounds = currentMonthBounds();

  let primaryMonthlyFromLedger = 0;
  if (primaryVehicle) {
    const { data: vehicleMonthLedger } = await supabase
      .from("reservation_daily_ledger")
      .select("owner_amount")
      .eq("vehicle_id", primaryVehicle.vehicle_id)
      .gte("ledger_date", monthBounds.from)
      .lte("ledger_date", monthBounds.to);

    primaryMonthlyFromLedger = (vehicleMonthLedger ?? []).reduce(
      (sum, row) => sum + Number(row.owner_amount ?? 0),
      0
    );
  }

  const { data: recentLedgerData } = await supabase
    .from("reservation_daily_ledger")
    .select("ledger_date, owner_amount, daily_total")
    .eq("owner_id", user.id)
    .order("ledger_date", { ascending: false })
    .limit(7);

  return (
    <div className="space-y-8">
      {primaryVehicle && (
        <VehicleHero
          ownerName={profileRes.data?.first_name ?? "Propriétaire"}
          brand={primaryVehicle.brand}
          model={primaryVehicle.model}
          status={primaryVehicle.status}
          vehicleId={primaryVehicle.vehicle_id}
          heroImageUrl={primaryVehicle.hero_image_url}
          fallbackImageUrl={primaryVehicle.image_url}
          totalRevenue={primaryRevenue.totalRevenue}
          ownerShare={primaryRevenue.ownerShare}
          companyShare={primaryRevenue.companyShare}
          monthlyRevenue={
            primaryMonthlyFromLedger ||
            computeVehicleMonthlyRevenue(
              previewReservations,
              primaryVehicle.vehicle_id
            ) ||
            Number(monthlyRevenueRes.data?.amount ?? 0)
          }
          reservationCount={countVehicleReservations(
            previewReservations,
            primaryVehicle.vehicle_id
          )}
          nextReservation={findVehicleNextReservation(
            previewReservations,
            primaryVehicle.vehicle_id
          )}
          fleetCount={vehicles.length}
        />
      )}

      <Section title="Transparence des revenus">
        <div className="space-y-6">
          <RevenueSplitCard
            totalRevenue={fleetRevenue.totalRevenue}
            ownerShare={fleetRevenue.ownerShare}
            companyShare={fleetRevenue.companyShare}
            title="Gains totaux de votre flotte"
          />
          <div>
            <p className="de-label mb-3">Journal des revenus (locations confirmées)</p>
            <DailyRevenueFeed entries={recentLedgerData ?? []} />
          </div>
        </div>
      </Section>

      {vehicles.length > 1 && (
        <Section title="Ma flotte">
          <VehicleList vehicles={vehicles} />
        </Section>
      )}

      <Suspense fallback={<SectionsSkeleton />}>
        <DashboardData
          vehicleIds={vehicleIds}
          userId={user.id}
          ledgerByReservation={ledgerByReservation}
        />
      </Suspense>
    </div>
  );
}
