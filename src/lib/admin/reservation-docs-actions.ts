"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/lib/admin/auth";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { notifyAllAdmins } from "@/src/lib/notifications/service";
import {
  UPLOAD_TOKEN_TTL_MS,
  buildDossierPublicUrl,
  buildDossierWhatsAppMessage,
} from "@/src/lib/reservations/client-docs";
import {
  generateUploadToken,
  hashUploadToken,
} from "@/src/lib/reservations/upload-token";

type ActionResult = {
  success: boolean;
  error?: string;
  url?: string;
  whatsappMessage?: string;
  expiresAt?: string;
};

function revalidateReservation(reservationId: string) {
  revalidatePath(`/admin/reservations/${reservationId}`);
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
}

export async function generateReservationDocsLink(
  reservationId: string
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("id, customer_name, vehicle_id, vehicles(brand, model)")
    .eq("id", reservationId)
    .maybeSingle();

  if (error || !reservation) {
    return { success: false, error: "Réservation introuvable" };
  }

  // Révoquer les liens actifs précédents
  await supabase
    .from("reservation_upload_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("reservation_id", reservationId)
    .is("revoked_at", null);

  const token = generateUploadToken();
  const tokenHash = hashUploadToken(token);
  const expiresAt = new Date(Date.now() + UPLOAD_TOKEN_TTL_MS).toISOString();

  const { error: insertError } = await supabase
    .from("reservation_upload_tokens")
    .insert({
      reservation_id: reservationId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_by: user.id,
    });

  if (insertError) {
    console.error("[generateReservationDocsLink]", insertError.message);
    return {
      success: false,
      error:
        insertError.message.includes("reservation_upload_tokens") ||
        insertError.code === "42P01"
          ? "Migration dossier locataire non appliquée sur Supabase."
          : insertError.message,
    };
  }

  const vehicleRaw = reservation.vehicles as
    | { brand: string; model: string }
    | { brand: string; model: string }[]
    | null;
  const vehicle = Array.isArray(vehicleRaw) ? vehicleRaw[0] : vehicleRaw;
  const vehicleLabel = vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : "véhicule";

  await supabase
    .from("reservations")
    .update({ contract_status: "awaiting_documents" })
    .eq("id", reservationId);

  const url = buildDossierPublicUrl(token);
  const whatsappMessage = buildDossierWhatsAppMessage({
    customerName: reservation.customer_name,
    vehicleLabel,
    dossierUrl: url,
  });

  await notifyAllAdmins(supabase, {
    excludeProfileId: user.id,
    type: "reservation_docs_link",
    title: "Lien documents généré",
    message: `${reservation.customer_name ?? "Client"} — ${vehicleLabel}`,
    related_id: reservationId,
    created_by: user.id,
  });

  revalidateReservation(reservationId);

  return { success: true, url, whatsappMessage, expiresAt };
}

export async function revokeReservationDocsLinks(
  reservationId: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("reservation_upload_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("reservation_id", reservationId)
    .is("revoked_at", null);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateReservation(reservationId);
  return { success: true };
}

export async function markReservationDocsReviewed(
  reservationId: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("reservations")
    .update({ docs_status: "reviewed" })
    .eq("id", reservationId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateReservation(reservationId);
  return { success: true };
}

export async function deleteReservationClientDocument(
  documentId: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: doc, error } = await supabase
    .from("reservation_documents")
    .select("id, reservation_id, storage_path, type")
    .eq("id", documentId)
    .maybeSingle();

  if (error || !doc) {
    return { success: false, error: "Document introuvable" };
  }

  await admin.storage
    .from("reservation-documents")
    .remove([doc.storage_path]);

  const { error: deleteError } = await supabase
    .from("reservation_documents")
    .delete()
    .eq("id", documentId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  const { data: remaining } = await supabase
    .from("reservation_documents")
    .select("type")
    .eq("reservation_id", doc.reservation_id);

  const { computeDocsStatus } = await import(
    "@/src/lib/reservations/client-docs"
  );

  await supabase
    .from("reservations")
    .update({
      docs_status: computeDocsStatus((remaining ?? []).map((row) => row.type)),
    })
    .eq("id", doc.reservation_id);

  revalidateReservation(doc.reservation_id);
  return { success: true };
}
