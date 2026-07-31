import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import DocumentsPanel from "@/src/components/admin/documents-panel";
import { fetchDocumentsList } from "@/src/lib/admin/documents-data";

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule?: string }>;
}) {
  await requireAdmin();
  const { vehicule } = await searchParams;
  const { items, stats } = await fetchDocumentsList();

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
          Documents
        </h1>
        <p className="mt-1 text-sm de-muted">
          Gestion centralisée des documents administratifs de la flotte
        </p>
      </div>

      <Section title="Vue d'ensemble">
        <DocumentsPanel
          items={items}
          stats={stats}
          initialVehicleId={vehicule}
        />
      </Section>
    </div>
  );
}
