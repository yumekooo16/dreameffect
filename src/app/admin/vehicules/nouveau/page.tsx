import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import VehicleForm from "@/src/components/admin/vehicle-form";
import { fetchOwnersForSelect } from "@/src/lib/admin/vehicles-data";

export default async function NewVehiclePage() {
  await requireAdmin();
  const owners = await fetchOwnersForSelect();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/vehicules"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour à la flotte
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Ajouter un véhicule
        </h1>
      </div>

      <Section title="Informations du véhicule">
        <VehicleForm
          owners={owners}
          mode="create"
          cancelHref="/admin/vehicules"
        />
      </Section>
    </div>
  );
}
