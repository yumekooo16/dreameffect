"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/lib/admin/auth";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import {
  CONTRACT_FIELD_DEFS,
  type ContractFieldName,
} from "@/src/lib/contracts/fields";
import {
  extractContractFieldsFromDocuments,
  mergeExtractedFieldsWithConsistency,
} from "@/src/lib/contracts/ocr";
import {
  buildFilledContractPdf,
  mapFieldsToPayload,
  CONTRACT_TEMPLATE_VERSION,
} from "@/src/lib/contracts/generate-pdf";
import {
  RESERVATION_CONTRACTS_BUCKET,
  RESERVATION_DOCS_BUCKET,
} from "@/src/lib/reservations/client-docs";
import { notifyAllAdmins } from "@/src/lib/notifications/service";

type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  downloadUrl?: string;
};

function revalidateReservation(reservationId: string) {
  revalidatePath(`/admin/reservations/${reservationId}`);
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
}

async function setContractStatus(reservationId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reservations")
    .update({ contract_status: status })
    .eq("id", reservationId);
  if (error) {
    console.error("[setContractStatus]", error.message);
  }
}

export async function analyzeReservationDocuments(
  reservationId: string
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  await setContractStatus(reservationId, "analyzing");

  const { data: docs, error } = await supabase
    .from("reservation_documents")
    .select("id, type, storage_path, mime_type, original_filename")
    .eq("reservation_id", reservationId);

  if (error) {
    await setContractStatus(reservationId, "needs_review");
    return { success: false, error: error.message };
  }

  if (!docs?.length) {
    await setContractStatus(reservationId, "awaiting_documents");
    return { success: false, error: "Aucun document à analyser." };
  }

  try {
    const inputs = [];
    for (const doc of docs) {
      const { data: file, error: downloadError } = await admin.storage
        .from(RESERVATION_DOCS_BUCKET)
        .download(doc.storage_path);

      if (downloadError || !file) {
        console.error("[analyze:download]", doc.type, downloadError?.message);
        continue;
      }

      inputs.push({
        type: doc.type,
        mimeType: doc.mime_type || file.type || "image/jpeg",
        bytes: new Uint8Array(await file.arrayBuffer()),
        filename: doc.original_filename ?? doc.type,
      });

      await admin
        .from("reservation_documents")
        .update({ processing_status: "analyzing" })
        .eq("id", doc.id);
    }

    const extraction = await extractContractFieldsFromDocuments(inputs);
    const merged = mergeExtractedFieldsWithConsistency(
      reservationId,
      extraction.fields
    );

    const { data: reservation } = await supabase
      .from("reservations")
      .select("customer_email, customer_phone, customer_name")
      .eq("id", reservationId)
      .maybeSingle();

    for (const field of merged) {
      if (
        field.field_name === "email" &&
        !field.value &&
        reservation?.customer_email
      ) {
        field.value = reservation.customer_email;
        field.source_document = "reservation";
        field.confidence = "high";
        field.needs_review = false;
        field.status = "manual";
      }
      if (
        field.field_name === "phone" &&
        !field.value &&
        reservation?.customer_phone
      ) {
        field.value = reservation.customer_phone;
        field.source_document = "reservation";
        field.confidence = "high";
        field.needs_review = false;
        field.status = "manual";
      }
    }

    for (const field of merged) {
      const { error: upsertError } = await admin
        .from("reservation_extracted_fields")
        .upsert(
          {
            reservation_id: reservationId,
            field_name: field.field_name,
            value: field.value,
            confidence: field.confidence,
            source_document: field.source_document,
            status: field.status,
            needs_review: field.needs_review,
            inconsistency_note: field.inconsistency_note,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "reservation_id,field_name" }
        );

      if (upsertError) {
        console.error("[analyze:upsert]", upsertError.message);
        throw new Error(
          upsertError.message.includes("reservation_extracted_fields")
            ? "Migration contrat non appliquée sur Supabase."
            : upsertError.message
        );
      }
    }

    for (const doc of docs) {
      await admin
        .from("reservation_documents")
        .update({ processing_status: "analyzed" })
        .eq("id", doc.id);
    }

    await setContractStatus(reservationId, "needs_review");

    await notifyAllAdmins(supabase, {
      excludeProfileId: user.id,
      type: "reservation_docs_uploaded",
      title: "Extraction dossier terminée",
      message: `${reservation?.customer_name ?? "Client"} — vérification requise`,
      related_id: reservationId,
      created_by: user.id,
    });

    revalidateReservation(reservationId);
    return {
      success: true,
      message:
        extraction.provider === "none"
          ? extraction.rawNotes ??
            "Extraction auto indisponible — complétez les champs manuellement."
          : "Extraction terminée. Vérifiez chaque champ avant de générer le contrat.",
    };
  } catch (err) {
    console.error("[analyzeReservationDocuments]", err);
    await setContractStatus(reservationId, "needs_review");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Analyse impossible. Réessayez ou saisissez manuellement.",
    };
  }
}

export async function saveExtractedFields(
  reservationId: string,
  values: Record<string, string>
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const saved = await upsertExtractedFieldValues(
    reservationId,
    user.id,
    values
  );
  if (!saved.success) return saved;
  revalidateReservation(reservationId);
  return { success: true, message: "Informations enregistrées." };
}

const SUGGESTED_CONTRACT_FIELDS: ContractFieldName[] = [
  "first_name",
  "last_name",
  "birth_date",
  "address",
  "postal_code",
  "city",
  "driving_license_number",
];

/** Persiste les valeurs du formulaire admin (saisie manuelle / corrections). */
async function upsertExtractedFieldValues(
  reservationId: string,
  userId: string,
  values: Record<string, string>
): Promise<{ success: true } | { success: false; error: string }> {
  const admin = createAdminClient();
  const allowed = new Set(CONTRACT_FIELD_DEFS.map((item) => item.name));

  for (const [fieldName, raw] of Object.entries(values)) {
    if (!allowed.has(fieldName as ContractFieldName)) continue;
    const value = raw.trim() ? raw.trim() : null;

    const { error } = await admin.from("reservation_extracted_fields").upsert(
      {
        reservation_id: reservationId,
        field_name: fieldName,
        value,
        confidence: "high",
        source_document: "manual",
        status: "manual",
        needs_review: false,
        inconsistency_note: null,
        validated_by: userId,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "reservation_id,field_name" }
    );

    if (error) {
      return {
        success: false,
        error: error.message.includes("reservation_extracted_fields")
          ? "Migration contrat non appliquée sur Supabase."
          : error.message,
      };
    }
  }

  return { success: true };
}

export async function validateExtractedFields(
  reservationId: string,
  formValues?: Record<string, string>
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const admin = createAdminClient();

  if (formValues) {
    const saved = await upsertExtractedFieldValues(
      reservationId,
      user.id,
      formValues
    );
    if (!saved.success) return saved;
  }

  const { data: fields, error } = await admin
    .from("reservation_extracted_fields")
    .select("field_name, value, inconsistency_note")
    .eq("reservation_id", reservationId);

  if (error) return { success: false, error: error.message };

  const byName = new Map((fields ?? []).map((row) => [row.field_name, row]));
  const missing = SUGGESTED_CONTRACT_FIELDS.filter(
    (name) => !byName.get(name)?.value?.trim()
  );

  // Les trous ne bloquent plus : le PDF peut être généré avec des zones vides
  // (à compléter à la main sur le papier si besoin).
  const conflicts = (fields ?? []).filter((row) => row.inconsistency_note);
  if (conflicts.length > 0) {
    return {
      success: false,
      error:
        "Des incohérences restent à résoudre (corrigez les champs concernés).",
    };
  }

  await admin
    .from("reservation_extracted_fields")
    .update({
      status: "validated",
      needs_review: false,
      validated_by: user.id,
      validated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("reservation_id", reservationId);

  await setContractStatus(reservationId, "validated");
  revalidateReservation(reservationId);
  return {
    success: true,
    message:
      missing.length > 0
        ? `Informations validées (zones vides OK : ${missing.join(", ")}). Vous pouvez générer le PDF.`
        : "Informations validées.",
  };
}

export async function generateReservationContract(
  reservationId: string,
  formValues?: Record<string, string>
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  // Toujours repartir du formulaire admin s'il est fourni (évite l'écart UI ↔ DB).
  if (formValues) {
    const saved = await upsertExtractedFieldValues(
      reservationId,
      user.id,
      formValues
    );
    if (!saved.success) return saved;
  }

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select(
      "id, start_date, end_date, pickup_location, return_location, total_price, distance_km, customer_name, contract_status, vehicle_id, vehicles(brand, model, plate, vin, deposit, color, mileage)"
    )
    .eq("id", reservationId)
    .maybeSingle();

  if (error || !reservation) {
    return { success: false, error: "Réservation introuvable" };
  }

  const { data: fields } = await admin
    .from("reservation_extracted_fields")
    .select("field_name, value")
    .eq("reservation_id", reservationId);

  const values: Record<string, string | null> = {};
  for (const row of fields ?? []) {
    values[row.field_name] = row.value;
  }

  // Fallback léger depuis le nom réservation si prénom/nom vides.
  if ((!values.first_name || !values.last_name) && reservation.customer_name) {
    const parts = reservation.customer_name.trim().split(/\s+/);
    if (parts.length >= 2) {
      if (!values.first_name) values.first_name = parts.slice(0, -1).join(" ");
      if (!values.last_name) values.last_name = parts[parts.length - 1] ?? null;
    } else if (!values.last_name) {
      values.last_name = reservation.customer_name.trim();
    }
  }

  const vehicleRaw = reservation.vehicles as
    | {
        brand: string;
        model: string;
        plate?: string | null;
        vin?: string | null;
        deposit?: number | null;
        color?: string | null;
        mileage?: number | null;
      }
    | {
        brand: string;
        model: string;
        plate?: string | null;
        vin?: string | null;
        deposit?: number | null;
        color?: string | null;
        mileage?: number | null;
      }[]
    | null;
  const vehicle = Array.isArray(vehicleRaw) ? vehicleRaw[0] : vehicleRaw;

  const payload = mapFieldsToPayload(values, {
    id: reservation.id,
    start_date: reservation.start_date,
    end_date: reservation.end_date,
    pickup_location: reservation.pickup_location,
    return_location: reservation.return_location,
    total_price: reservation.total_price,
    distance_km: reservation.distance_km,
    vehicle_brand: vehicle?.brand ?? null,
    vehicle_model: vehicle?.model ?? null,
    vehicle_label: vehicle ? `${vehicle.brand} ${vehicle.model}` : "Véhicule",
    vehicle_plate: vehicle?.plate ?? null,
    vehicle_vin: vehicle?.vin ?? null,
    vehicle_color: vehicle?.color ?? null,
    vehicle_mileage: vehicle?.mileage ?? null,
    deposit: vehicle?.deposit ?? null,
    signed_at_place: "Beauvais",
  });

  const pdfBytes = await buildFilledContractPdf(payload);
  const fileName = `contrat-${reservation.id.slice(0, 8)}.pdf`;
  const storagePath = `${reservation.id}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await admin.storage
    .from(RESERVATION_CONTRACTS_BUCKET)
    .upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return {
      success: false,
      error: uploadError.message.includes("Bucket not found")
        ? "Bucket reservation-contracts manquant. Appliquez la migration SQL."
        : uploadError.message,
    };
  }

  await admin
    .from("reservation_contracts")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("reservation_id", reservationId)
    .in("status", ["draft", "generated", "downloaded"]);

  const { error: insertError } = await admin.from("reservation_contracts").insert({
    reservation_id: reservationId,
    status: "generated",
    template_version: CONTRACT_TEMPLATE_VERSION,
    storage_path: storagePath,
    file_name: fileName,
    generated_by: user.id,
    generated_at: new Date().toISOString(),
    payload_snapshot: payload,
  });

  if (insertError) {
    await admin.storage
      .from(RESERVATION_CONTRACTS_BUCKET)
      .remove([storagePath]);
    return { success: false, error: insertError.message };
  }

  await setContractStatus(reservationId, "contract_generated");

  const { data: signed } = await admin.storage
    .from(RESERVATION_CONTRACTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 30);

  const blankCount = SUGGESTED_CONTRACT_FIELDS.filter(
    (name) => !values[name]?.trim()
  ).length;

  revalidateReservation(reservationId);
  return {
    success: true,
    message:
      blankCount > 0
        ? `Contrat généré (${blankCount} zone(s) volontairement vide(s) — à compléter à la main si besoin).`
        : "Contrat officiel rempli (variables uniquement — clauses avocat inchangées).",
    downloadUrl: signed?.signedUrl,
  };
}
