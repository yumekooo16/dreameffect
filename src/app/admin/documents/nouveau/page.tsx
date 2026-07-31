import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import DocumentForm from "@/src/components/admin/documents-form";
import { fetchVehiclesForDocumentForm } from "@/src/lib/admin/documents-data";
import type { DocumentType } from "@/src/lib/documents/type";

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule?: string; type?: string }>;
}) {
  await requireAdmin();
  const { vehicule, type } = await searchParams;
  const vehicles = await fetchVehiclesForDocumentForm();

  const selectedVehicle = vehicule
    ? vehicles.find((v) => v.id === vehicule)
    : undefined;

  const initialType = (
    ["registration", "insurance", "other", "contract", "invoice"].includes(
      type ?? ""
    )
      ? type
      : undefined
  ) as DocumentType | undefined;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={
            vehicule
              ? `/admin/documents?vehicule=${vehicule}`
              : "/admin/documents"
          }
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour aux documents
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Ajouter un document
        </h1>
      </div>

      <Section title="Informations du document">
        <DocumentForm
          vehicles={vehicles}
          mode="create"
          cancelHref={
            vehicule
              ? `/admin/documents?vehicule=${vehicule}`
              : "/admin/documents"
          }
          initial={
            selectedVehicle || initialType
              ? {
                  vehicle_id: selectedVehicle?.id,
                  type: initialType,
                }
              : undefined
          }
        />
      </Section>
    </div>
  );
}
