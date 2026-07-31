import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import ReservationForm from "@/src/components/admin/reservation-form";
import { fetchVehiclesForReservationForm } from "@/src/lib/admin/reservations-data";

export default async function NewReservationPage() {
  await requireAdmin();
  const vehicles = await fetchVehiclesForReservationForm();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/reservations"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour aux réservations
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Créer une réservation
        </h1>
      </div>

      <Section title="Informations de location">
        <ReservationForm
          vehicles={vehicles}
          mode="create"
          cancelHref="/admin/reservations"
        />
      </Section>
    </div>
  );
}
