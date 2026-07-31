import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import MaintenanceForm from "@/src/components/admin/maintenance-form";
import { fetchVehiclesForMaintenanceForm } from "@/src/lib/admin/maintenance-data";

export default async function NewMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule?: string }>;
}) {
  await requireAdmin();
  const { vehicule } = await searchParams;
  const vehicles = await fetchVehiclesForMaintenanceForm();

  const selectedVehicle = vehicule
    ? vehicles.find((v) => v.id === vehicule)
    : undefined;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={
            vehicule
              ? `/admin/maintenance?vehicule=${vehicule}`
              : "/admin/maintenance"
          }
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour à la maintenance
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Ajouter une intervention
        </h1>
      </div>

      <Section title="Informations de l'intervention">
        <MaintenanceForm
          vehicles={vehicles}
          mode="create"
          cancelHref={
            vehicule
              ? `/admin/maintenance?vehicule=${vehicule}`
              : "/admin/maintenance"
          }
          initial={
            selectedVehicle
              ? {
                  vehicle_id: selectedVehicle.id,
                  mileage: selectedVehicle.mileage,
                }
              : undefined
          }
        />
      </Section>
    </div>
  );
}
