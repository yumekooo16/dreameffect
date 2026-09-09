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

function isUploadBlob(value: FormDataEntryValue | null): boolean {
  if (value == null || typeof value === "string") return false;
  const blob = value as Blob;
  return (
    typeof blob.arrayBuffer === "function" &&
    typeof blob.size === "number" &&
    blob.size > 0
  );
}

function blobFilename(value: FormDataEntryValue, fallback: string) {
  if (value instanceof File && value.name) return value.name;
  return fallback;
}

function blobMime(value: FormDataEntryValue, filename: string) {
  const typed = value instanceof Blob ? (value.type || "").toLowerCase() : "";
  if (typed && typed !== "application/octet-stream") return typed;
  if (/\.pdf$/i.test(filename)) return "application/pdf";
  if (/\.png$/i.test(filename)) return "image/png";
  if (/\.webp$/i.test(filename)) return "image/webp";
  if (/\.jpe?g$/i.test(filename)) return "image/jpeg";
  return "image/jpeg";
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

  if (error) {
    console.error("[validateToken]", error.message);
    return null;
  }
  if (!data) return null;
  if (data.revoked_at || data.expires_at <= nowIso) return null;

  return data;
}

export async function submitReservationDossier(
  formData: FormData
): Promise<UploadResult> {
  try {
    const token = String(formData.get("token") ?? "");
    const tokenRow = await validateToken(token);

    if (!tokenRow) {
      return {
        success: false,
        error:
          "Ce lien n'est plus valide. Demandez un nouveau lien à DreamEffect.",
      };
    }

    const admin = createAdminClient();
    let uploadedCount = 0;

    for (const docType of RESERVATION_DOC_TYPES) {
      const value = formData.get(docType.fieldName);
      if (!isUploadBlob(value) || value == null || typeof value === "string") {
        continue;
      }

      const filename = blobFilename(value, `${docType.value}.jpg`);
      const mime = blobMime(value, filename);

      if (value.size > MAX_DOC_BYTES) {
        return {
          success: false,
          error: `${docType.label} trop volumineux (max 5 Mo).`,
        };
      }

      if (!ALLOWED_DOC_MIME.has(mime)) {
        return {
          success: false,
          error: `${docType.label} : format non accepté (JPG, PNG, WebP ou PDF). Sur iPhone, choisissez « Image » plutôt que HEIC si besoin.`,
        };
      }

      if (!isReservationDocType(docType.value)) continue;

      const ext = extensionForMime(mime, filename);
      const storagePath = `${tokenRow.reservation_id}/${docType.value}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(await value.arrayBuffer());

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
        await admin.from("reservation_documents").delete().eq("id", existing.id);
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
          error: uploadError.message.includes("Bucket not found")
            ? "Stockage documents non configuré (bucket manquant). Contactez DreamEffect."
            : `Échec de l'envoi (${docType.label}). Réessayez avec une photo plus légère.`,
        };
      }

      const { error: insertError } = await admin
        .from("reservation_documents")
        .insert({
          reservation_id: tokenRow.reservation_id,
          type: docType.value as ReservationDocType,
          storage_path: storagePath,
          original_filename: filename.slice(0, 180),
          mime_type: mime,
          file_size: value.size,
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
      .select("id, customer_name, vehicle_id, vehicles(brand, model, owner_id)")
      .eq("id", tokenRow.reservation_id)
      .maybeSingle();

    const vehicleRaw = reservation?.vehicles as
      | { brand: string; model: string; owner_id?: string }
      | { brand: string; model: string; owner_id?: string }[]
      | null
      | undefined;
    const vehicle = Array.isArray(vehicleRaw) ? vehicleRaw[0] : vehicleRaw;
    const vehicleLabel = vehicle
      ? `${vehicle.brand} ${vehicle.model}`
      : "véhicule";

    const uploadedLabels = RESERVATION_DOC_TYPES.filter((item) =>
      (allDocs ?? []).some((doc) => doc.type === item.value)
    ).map((item) => item.shortLabel);

    try {
      await notifySystemEvent(admin, {
        ownerId: vehicle?.owner_id ?? null,
        type: "reservation_docs_uploaded",
        title:
          docsStatus === "complete"
            ? "Dossier documents complet"
            : "Documents locataire reçus",
        message: `${reservation?.customer_name ?? "Client"} — ${vehicleLabel} (${uploadedLabels.join(", ")})`,
        related_id: tokenRow.reservation_id,
        priority: docsStatus === "complete" ? "high" : "medium",
      });
    } catch (notifyError) {
      console.error("[submitReservationDossier:notify]", notifyError);
      // L'upload a réussi : on ne bloque pas le client, mais on journalise fort.
    }

    revalidatePath(`/admin/reservations/${tokenRow.reservation_id}`);
    revalidatePath("/admin/reservations");
    revalidatePath("/admin");

    return { success: true, uploadedCount, docsStatus };
  } catch (error) {
    console.error("[submitReservationDossier]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur serveur pendant l'envoi. Réessayez avec des fichiers plus légers.",
    };
  }
}

export async function getMissingDocLabels(uploadedTypes: string[]) {
  return RESERVATION_DOC_TYPES.filter(
    (item) => !uploadedTypes.includes(item.value)
  ).map((item) => getReservationDocTypeLabel(item.value));
}
