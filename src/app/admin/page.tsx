import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import AdminWelcome from "@/src/components/admin/welcome";
import StatsGrid from "@/src/components/admin/stats-grid";
import AdminDashboardSections from "@/src/components/admin/dashboard-sections";
import { fetchAdminDashboardData } from "@/src/lib/admin/dashboard-data";

export default async function AdminDashboardPage() {
  const { profile } = await requireAdmin();
  const data = await fetchAdminDashboardData();

  return (
    <div className="space-y-8">
      <AdminWelcome
        name={profile.first_name ?? "Administrateur"}
        stats={{
          vehiclesCount: data.stats.vehiclesCount,
          activeReservations: data.stats.activeReservations,
          monthlyRevenue: data.stats.monthlyRevenue,
          alertsCount: data.alerts.length,
        }}
      />

      <Section title="Indicateurs clés">
        <StatsGrid stats={data.stats} />
      </Section>

      <AdminDashboardSections
        stats={data.stats}
        insights={data.insights}
        monthlyRevenues={data.monthlyRevenues}
        monthlyReservationCounts={data.monthlyReservationCounts}
        activity={data.activity}
        alerts={data.alerts}
      />
    </div>
  );
}
