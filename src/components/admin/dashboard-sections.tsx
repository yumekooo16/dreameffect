import Section from "@/src/components/owner/section";
import dynamic from "next/dynamic";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import LazyWhenVisible from "@/src/components/owner/lazy-when-visible";
import ActivityList from "./activity-list";
import AlertPanel from "./alert-panel";
import RevenueSection from "./revenue-section";
import AdvancedInsights from "./advanced-insights";
import type {
  ActivityEvent,
  AlertItem,
  DashboardInsights,
  DashboardStats,
  MonthlyReservationCount,
  MonthlyRevenue,
} from "@/src/lib/admin/dashboard-data";

const RevenueChart = dynamic(
  () => import("@/src/components/revenue-chart"),
  { loading: () => <ChartSkeleton /> }
);

const ReservationsChart = dynamic(
  () => import("./reservations-chart"),
  { loading: () => <ChartSkeleton /> }
);

export default function AdminDashboardSections({
  stats,
  insights,
  monthlyRevenues,
  monthlyReservationCounts,
  activity,
  alerts,
}: {
  stats: DashboardStats;
  insights: DashboardInsights;
  monthlyRevenues: MonthlyRevenue[];
  monthlyReservationCounts: MonthlyReservationCount[];
  activity: ActivityEvent[];
  alerts: AlertItem[];
}) {
  return (
    <>
      <Section title="Analyse avancée">
        <AdvancedInsights insights={insights} />
      </Section>

      <Section title="Vue financière">
        <RevenueSection stats={stats} />
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Évolution des revenus">
          <LazyWhenVisible>
            <RevenueChart data={monthlyRevenues} />
          </LazyWhenVisible>
        </Section>

        <Section title="Évolution des réservations">
          <LazyWhenVisible>
            <ReservationsChart data={monthlyReservationCounts} />
          </LazyWhenVisible>
        </Section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Activité récente">
          <ActivityList events={activity} />
        </Section>

        <Section title="Alertes">
          <AlertPanel alerts={alerts} />
        </Section>
      </div>
    </>
  );
}
