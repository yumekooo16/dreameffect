import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import MaintenancePanel from "@/src/components/admin/maintenance-panel";
import { fetchMaintenanceList } from "@/src/lib/admin/maintenance-data";

export default async function AdminMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule?: string }>;
}) {
  await requireAdmin();
  const { vehicule } = await searchParams;
  const { items, stats, costByVehicle, costByMonth } =
    await fetchMaintenanceList();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Tableau de bord
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Maintenance
        </h1>
        <p className="mt-1 text-sm de-muted">
          Suivi des entretiens et interventions de la flotte DreamEffect
        </p>
      </div>

      <Section title="Vue d'ensemble">
        <MaintenancePanel
          items={items}
          stats={stats}
          costByVehicle={costByVehicle}
          costByMonth={costByMonth}
          initialVehicleId={vehicule}
        />
      </Section>
    </div>
  );
}
