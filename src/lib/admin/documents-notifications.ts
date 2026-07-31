import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentRecord } from "@/src/lib/admin/documents-types";
import {
  getDocumentTypeLabel,
  isDocumentExpiringSoon,
} from "@/src/lib/documents/type";
import { daysUntilExpiration } from "@/src/lib/admin/documents-types";
import { notifyOwnerAndAdmins } from "@/src/lib/notifications/service";

type VehicleInfo = {
  brand: string;
  model: string;
  owner_id: string;
};

export async function notifyDocumentExpiring(
  supabase: SupabaseClient,
  document: DocumentRecord,
  vehicle: VehicleInfo,
  adminUserId: string
) {
  if (!isDocumentExpiringSoon(document)) return;

  const vehicleLabel = `${vehicle.brand} ${vehicle.model}`;
  const typeLabel = getDocumentTypeLabel(document.type);
  const days = daysUntilExpiration(document.expiration_date);
  const expirationLabel = document.expiration_date
    ? new Date(document.expiration_date).toLocaleDateString("fr-FR")
    : "—";

  const daysText =
    days != null && days >= 0
      ? `expire dans ${days} jour${days !== 1 ? "s" : ""}`
      : "a expiré";

  const message = `Le ${typeLabel.toLowerCase()} de ${vehicleLabel} (${document.name}) ${daysText} — échéance : ${expirationLabel}`;

  await notifyOwnerAndAdmins(supabase, {
    ownerId: vehicle.owner_id,
    adminUserId,
    type: "document_expiring",
    title: "Document bientôt expiré",
    message,
    related_id: document.id,
    priority: days != null && days < 0 ? "high" : "normal",
  });
}
