import Link from "next/link";
import Documents from "@/src/components/documents";
import type { VehicleDocumentRow } from "@/src/lib/admin/vehicles-types";

export default function VehicleDocumentsSection({
  documents,
  vehicleId,
}: {
  documents: VehicleDocumentRow[];
  vehicleId: string;
}) {
  return (
    <div className="space-y-4">
      <Documents documents={documents} />

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/documents?vehicule=${vehicleId}`}
          className="de-btn de-btn-ghost inline-flex text-sm"
        >
          Voir tous les documents →
        </Link>
        <Link
          href={`/admin/documents/nouveau?vehicule=${vehicleId}`}
          className="de-btn de-btn-primary inline-flex text-sm"
        >
          Ajouter un document
        </Link>
      </div>
    </div>
  );
}
