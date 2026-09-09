"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { notifySystemEvent } from "@/src/lib/notifications/service";
import {
  ALLOWED_DOC_MIME,
  MAX_DOC_BYTES,
  RESERVATION_DOCS_BUCKET,
  RESERVATION_DOC_TYPES,
  computeDocsStatus,
  getReservationDocTypeLabel,
  isReservationDocType,
  type ReservationDocType,
} from "@/src/lib/reservations/client-docs";
import { hashUploadToken } from "@/src/lib/reservations/upload-token";

type UploadResult = {
  success: boolean;
  error?: string;
  uploadedCount?: number;
  docsStatus?: string;
};

function extensionForMime(mime: string, filename: string) {
  if (mime === "application/pdf" || /\.pdf$/i.test(filename)) return "pdf";
  if (mime.includes("png") || /\.png$/i.test(filename)) return "png";
  if (mime.includes("webp") || /\.webp$/i.test(filename)) return "webp";
  return "jpg";
}

async function validateToken(rawToken: string) {
  const token = rawToken.trim();
  if (!token) return null;

  const admin = createAdminClient();
  const tokenHash = hashUploadToken(token);
  const nowIso = new Date().toISOString();

  const { data, error } = await admin
    .from("reservation_upload_tokens")
    .select("id, reservation_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;
  if (data.revoked_at || data.expires_at <= nowIso) return null;

  return data;
}

export async function submitReservationDossier(
  formData: FormData
): Promise<UploadResult> {
  const token = String(formData.get("token") ?? "");
  const tokenRow = await validateToken(token);

  if (!tokenRow) {
    return {
      success: false,
      error: "Ce lien n'est plus valide. Demandez un nouveau lien à DreamEffect.",
    };
  }

  const admin = createAdminClient();
  let uploadedCount = 0;

  for (const docType of RESERVATION_DOC_TYPES) {
    const file = formData.get(docType.fieldName);
    if (!(file instanceof File) || file.size <= 0) continue;

    if (file.size > MAX_DOC_BYTES) {
      return {
        success: false,
        error: `${docType.label} trop volumineux (max 5 Mo).`,
      };
    }

    const mime = (file.type || "application/octet-stream").toLowerCase();
    if (!ALLOWED_DOC_MIME.has(mime)) {
      return {
        success: false,
        error: `${docType.label} : format non accepté (JPG, PNG, WebP ou PDF).`,
      };
    }

    if (!isReservationDocType(docType.value)) continue;

    const ext = extensionForMime(mime, file.name);
    const storagePath = `${tokenRow.reservation_id}/${docType.value}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Remplacer l'ancien fichier du même type s'il existe
    const { data: existing } = await admin
      .from("reservation_documents")
      .select("id, storage_path")
      .eq("reservation_id", tokenRow.reservation_id)
      .eq("type", docType.value)
      .maybeSingle();

    if (existing?.storage_path) {
      await admin.storage
        .from(RESERVATION_DOCS_BUCKET)
        .remove([existing.storage_path]);
      await admin
        .from("reservation_documents")
        .delete()
        .eq("id", existing.id);
    }

    const { error: uploadError } = await admin.storage
      .from(RESERVATION_DOCS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mime,
        upsert: false,
      });

    if (uploadError) {
      console.error("[submitReservationDossier:upload]", uploadError.message);
      return {
        success: false,
        error: `Échec de l'envoi (${docType.label}). Réessayez.`,
      };
    }

    const { error: insertError } = await admin.from("reservation_documents").insert({
      reservation_id: tokenRow.reservation_id,
      type: docType.value as ReservationDocType,
      storage_path: storagePath,
      original_filename: file.name.slice(0, 180),
      mime_type: mime,
      file_size: file.size,
    });

    if (insertError) {
      await admin.storage.from(RESERVATION_DOCS_BUCKET).remove([storagePath]);
      console.error("[submitReservationDossier:insert]", insertError.message);
      return {
        success: false,
        error: insertError.message.includes("reservation_documents")
          ? "Migration dossier locataire non appliquée sur Supabase."
          : insertError.message,
      };
    }

    uploadedCount += 1;
  }

  if (uploadedCount === 0) {
    return {
      success: false,
      error: "Ajoutez au moins un document avant d'envoyer.",
    };
  }

  const { data: allDocs } = await admin
    .from("reservation_documents")
    .select("type")
    .eq("reservation_id", tokenRow.reservation_id);

  const docsStatus = computeDocsStatus((allDocs ?? []).map((row) => row.type));

  await admin
    .from("reservations")
    .update({ docs_status: docsStatus })
    .eq("id", tokenRow.reservation_id);

  await admin
    .from("reservation_upload_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, customer_name, vehicles(brand, model)")
    .eq("id", tokenRow.reservation_id)
    .maybeSingle();

  const vehicleRaw = reservation?.vehicles as
    | { brand: string; model: string }
    | { brand: string; model: string }[]
    | null
    | undefined;
  const vehicle = Array.isArray(vehicleRaw) ? vehicleRaw[0] : vehicleRaw;
  const vehicleLabel = vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : "véhicule";

  const uploadedLabels = RESERVATION_DOC_TYPES.filter((item) =>
    (allDocs ?? []).some((doc) => doc.type === item.value)
  ).map((item) => item.shortLabel);

  await notifySystemEvent(admin, {
    type: "reservation_docs_uploaded",
    title:
      docsStatus === "complete"
        ? "Dossier documents complet"
        : "Documents locataire reçus",
    message: `${reservation?.customer_name ?? "Client"} — ${vehicleLabel} (${uploadedLabels.join(", ")})`,
    related_id: tokenRow.reservation_id,
    priority: docsStatus === "complete" ? "high" : "medium",
  });

  revalidatePath(`/admin/reservations/${tokenRow.reservation_id}`);
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
  revalidatePath(`/dossier/${token}`);

  return { success: true, uploadedCount, docsStatus };
}

export async function getMissingDocLabels(uploadedTypes: string[]) {
  return RESERVATION_DOC_TYPES.filter(
    (item) => !uploadedTypes.includes(item.value)
  ).map((item) => getReservationDocTypeLabel(item.value));
}
