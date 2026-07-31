import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import VehicleListPanel from "@/src/components/admin/vehicle-list";
import { fetchVehiclesList } from "@/src/lib/admin/vehicles-data";

export default async function AdminVehiclesPage() {
  await requireAdmin();
  const vehicles = await fetchVehiclesList();

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
          Véhicules
        </h1>
        <p className="mt-1 text-sm de-muted">
          Gestion de la flotte automobile DreamEffect
        </p>
      </div>

      <Section title="Flotte">
        <VehicleListPanel vehicles={vehicles} />
      </Section>
    </div>
  );
}
