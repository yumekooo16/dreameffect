import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import OwnerListPanel from "@/src/components/admin/owner-list";
import { fetchOwnersList } from "@/src/lib/admin/owners-data";

export default async function AdminOwnersPage() {
  await requireAdmin();
  const owners = await fetchOwnersList();

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
          Propriétaires
        </h1>
        <p className="mt-1 text-sm de-muted">
          Gérez l&apos;ensemble des propriétaires DreamEffect
        </p>
      </div>

      <Section title="Liste des propriétaires">
        <OwnerListPanel owners={owners} />
      </Section>
    </div>
  );
}
