import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/lib/admin/auth";
import {
  fetchDocumentDetail,
  fetchVehiclesForDocumentForm,
} from "@/src/lib/admin/documents-data";
import {
  getDocumentStatusBadgeClass,
  getDocumentStatusLabel,
  getDocumentTypeBadgeClass,
  getDocumentTypeLabel,
  type DocumentType,
} from "@/src/lib/documents/type";
import Section from "@/src/components/owner/section";
import VehicleImage from "@/src/components/owner/vehicle-image";
import DocumentActionsPanel from "@/src/components/admin/document-actions";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [document, vehicles] = await Promise.all([
    fetchDocumentDetail(id),
    fetchVehiclesForDocumentForm(),
  ]);

  if (!document) {
    notFound();
  }

  const ownerName =
    [document.owner.first_name, document.owner.last_name]
      .filter(Boolean)
      .join(" ") || "Propriétaire";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/documents?vehicule=${document.vehicle_id}`}
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour aux documents
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
              {document.name}
            </h1>
            <p className="mt-1 text-sm de-muted capitalize">
              {document.vehicle_label} — {ownerName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`de-badge ${getDocumentTypeBadgeClass(document.type)}`}
            >
              {getDocumentTypeLabel(document.type)}
            </span>
            <span
              className={`de-badge ${getDocumentStatusBadgeClass(document)}`}
            >
              {getDocumentStatusLabel(document)}
            </span>
          </div>
        </div>
      </div>

      <Section title="Véhicule">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="relative h-40 overflow-hidden rounded-[var(--radius)] border border-[var(--blue-border)] bg-muted lg:h-full lg:min-h-[160px]">
            <VehicleImage
              src={document.vehicle.image_url}
              alt={document.vehicle_label}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="de-card-inner">
              <p className="de-label">Marque / Modèle</p>
              <Link
                href={`/admin/vehicules/${document.vehicle.id}`}
                className="mt-1 inline-block font-medium capitalize text-[var(--blue-soft)] hover:underline"
              >
                {document.vehicle.brand} {document.vehicle.model}
              </Link>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Propriétaire</p>
              <Link
                href={`/admin/proprietaires/${document.owner.id}`}
                className="mt-1 inline-block font-medium text-[var(--blue-soft)] hover:underline"
              >
                {ownerName}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Document">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="de-card-inner">
            <p className="de-label">Type</p>
            <p className="mt-1 font-medium">
              {getDocumentTypeLabel(document.type)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Nom</p>
            <p className="mt-1 font-medium">{document.name}</p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Date d&apos;expiration</p>
            <p className="mt-1 font-medium">
              {formatDate(document.expiration_date)}
            </p>
          </div>
          <div className="de-card-inner">
            <p className="de-label">Date d&apos;ajout</p>
            <p className="mt-1 font-medium">{formatDate(document.created_at)}</p>
          </div>
        </div>
      </Section>

      <Section title="Actions administrateur">
        <DocumentActionsPanel
          documentId={document.id}
          documentName={document.name}
          vehicles={vehicles}
          initial={{
            vehicle_id: document.vehicle_id,
            type: document.type as DocumentType,
            name: document.name,
            expiration_date: document.expiration_date?.slice(0, 10) ?? "",
          }}
        />
      </Section>
    </div>
  );
}
