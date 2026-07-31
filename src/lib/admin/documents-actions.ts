"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { requireAdmin } from "@/src/lib/admin/auth";
import type { DocumentFormData, DocumentRecord } from "@/src/lib/admin/documents-types";
import {
  computeDocumentIsValid,
  isDocumentExpiringSoon,
} from "@/src/lib/documents/type";
import { notifyDocumentExpiring } from "@/src/lib/admin/documents-notifications";

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

function revalidateDocumentPaths(id?: string, vehicleId?: string) {
  revalidatePath("/admin/documents");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/documents/${id}`);
  if (vehicleId) revalidatePath(`/admin/vehicules/${vehicleId}`);
  revalidatePath("/admin/vehicules");
  revalidatePath("/admin/proprietaires");
}

async function getVehicleInfo(vehicleId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("brand, model, owner_id")
    .eq("id", vehicleId)
    .single();

  return data;
}

function defaultNameForType(type: DocumentFormData["type"]) {
  if (type === "registration") return "Carte grise";
  if (type === "insurance") return "Assurance";
  if (type === "other") return "Contrôle technique";
  return "";
}

function validateForm(data: DocumentFormData): string | null {
  if (!data.vehicle_id) return "Véhicule requis";
  if (!data.type) return "Type de document requis";
  if (!data.name.trim()) return "Nom du document requis";
  return null;
}

function buildPayload(data: DocumentFormData, ownerId: string, userId: string) {
  const expirationDate = data.expiration_date
    ? new Date(data.expiration_date).toISOString()
    : null;

  return {
    vehicle_id: data.vehicle_id,
    owner_id: ownerId,
    type: data.type,
    name: data.name.trim() || defaultNameForType(data.type),
    file_url: "",
    expiration_date: expirationDate,
    is_valid: computeDocumentIsValid(expirationDate),
    uploaded_by: userId,
  };
}

async function maybeNotifyExpiring(
  supabase: Awaited<ReturnType<typeof createClient>>,
  document: DocumentRecord,
  adminUserId: string,
  previousExpiration?: string | null
) {
  if (!isDocumentExpiringSoon(document)) return;

  const vehicle = await getVehicleInfo(document.vehicle_id);
  if (!vehicle) return;

  if (previousExpiration !== undefined) {
    const wasExpiring = isDocumentExpiringSoon({
      expiration_date: previousExpiration,
      is_valid: true,
    });

    if (wasExpiring && previousExpiration === document.expiration_date) {
      return;
    }
  }

  await notifyDocumentExpiring(supabase, document, vehicle, adminUserId);
}

export async function createDocument(
  data: DocumentFormData
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const validationError = validateForm(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const vehicle = await getVehicleInfo(data.vehicle_id);
  if (!vehicle) {
    return { success: false, error: "Véhicule introuvable" };
  }

  const { data: document, error } = await supabase
    .from("documents")
    .insert(buildPayload(data, vehicle.owner_id, user.id))
    .select(
      "id, vehicle_id, owner_id, type, name, expiration_date, is_valid, created_at"
    )
    .single();

  if (error || !document) {
    return { success: false, error: error?.message ?? "Création impossible" };
  }

  await maybeNotifyExpiring(
    supabase,
    document as DocumentRecord,
    user.id
  );

  revalidateDocumentPaths(document.id, document.vehicle_id);
  return { success: true, id: document.id };
}

export async function updateDocument(
  documentId: string,
  data: DocumentFormData
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("documents")
    .select("id, vehicle_id, expiration_date")
    .eq("id", documentId)
    .single();

  if (!existing) {
    return { success: false, error: "Document introuvable" };
  }

  const validationError = validateForm(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const vehicle = await getVehicleInfo(data.vehicle_id);
  if (!vehicle) {
    return { success: false, error: "Véhicule introuvable" };
  }

  const expirationDate = data.expiration_date
    ? new Date(data.expiration_date).toISOString()
    : null;

  const { data: document, error } = await supabase
    .from("documents")
    .update({
      vehicle_id: data.vehicle_id,
      owner_id: vehicle.owner_id,
      type: data.type,
      name: data.name.trim() || defaultNameForType(data.type),
      expiration_date: expirationDate,
      is_valid: computeDocumentIsValid(expirationDate),
      uploaded_by: user.id,
    })
    .eq("id", documentId)
    .select(
      "id, vehicle_id, owner_id, type, name, expiration_date, is_valid, created_at"
    )
    .single();

  if (error || !document) {
    return { success: false, error: error?.message ?? "Mise à jour impossible" };
  }

  await maybeNotifyExpiring(
    supabase,
    document as DocumentRecord,
    user.id,
    existing.expiration_date
  );

  revalidateDocumentPaths(documentId, document.vehicle_id);
  if (existing.vehicle_id !== document.vehicle_id) {
    revalidateDocumentPaths(undefined, existing.vehicle_id);
  }

  return { success: true, id: documentId };
}

export async function deleteDocument(documentId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("documents")
    .select("id, vehicle_id")
    .eq("id", documentId)
    .single();

  if (!existing) {
    return { success: false, error: "Document introuvable" };
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateDocumentPaths(documentId, existing.vehicle_id);
  return { success: true, id: documentId };
}
