import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import ReservationsPanel from "@/src/components/admin/reservations-panel";
import { fetchReservationsList } from "@/src/lib/admin/reservations-data";

export default async function AdminReservationsPage() {
  await requireAdmin();
  const { items, stats } = await fetchReservationsList();

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
          Réservations
        </h1>
        <p className="mt-1 text-sm de-muted">
          Centre de gestion des locations DreamEffect
        </p>
      </div>

      <Section title="Vue d'ensemble">
        <ReservationsPanel items={items} stats={stats} />
      </Section>
    </div>
  );
}
