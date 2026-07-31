import Section from "@/src/components/owner/section";
import dynamic from "next/dynamic";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import LazyWhenVisible from "@/src/components/owner/lazy-when-visible";
import Documents from "@/src/components/documents";
import Maintenance from "@/src/components/maintenance";
import Reservations from "@/src/components/reservations";
import VehicleStats from "@/src/components/vehicle-stats";

const RevenueChart = dynamic(
  () => import("@/src/components/revenue-chart"),
  { loading: () => <ChartSkeleton /> }
);

const Calendar = dynamic(
  () => import("@/src/components/calendar"),
  { loading: () => <ChartSkeleton /> }
);

type ReservationRow = {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  customer_name?: string | null;
  status: string;
  owner_amount?: number | null;
  total_price?: number | null;
};

type MaintenanceRow = {
  id: string;
  title: string;
  type: string;
  description?: string | null;
  mileage?: number | null;
  maintenance_date?: string | null;
  next_due_date?: string | null;
};

type DocumentRow = {
  id: string;
  type: string;
  name: string;
  file_url: string;
  expiration_date?: string | null;
  is_valid?: boolean | null;
};

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

export default function DashboardSections({
  reservations,
  maintenances,
  documents,
  stats,
  monthlyRevenues,
}: {
  reservations: ReservationRow[];
  maintenances: MaintenanceRow[];
  documents: DocumentRow[];
  stats: {
    total_rentals: number;
    total_revenue: number;
    owner_revenue: number;
    rented_days: number;
    average_revenue: number;
  };
  monthlyRevenues: MonthlyRevenue[];
}) {
  return (
    <>
      <Section title="Évolution des revenus">
        <LazyWhenVisible>
          <RevenueChart data={monthlyRevenues} />
        </LazyWhenVisible>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Réservations">
          <Reservations reservations={reservations.slice(0, 15)} />
        </Section>

        <Section title="Statistiques">
          <VehicleStats stats={stats} />
        </Section>
      </div>

      <Section title="Calendrier">
        <LazyWhenVisible>
          <Calendar reservations={reservations} maintenances={maintenances} />
        </LazyWhenVisible>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Documents">
          <Documents documents={documents} />
        </Section>

        <Section title="Entretien">
          <Maintenance maintenances={maintenances} />
        </Section>
      </div>
    </>
  );
}
