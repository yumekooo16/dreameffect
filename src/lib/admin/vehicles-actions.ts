"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { requireAdmin } from "@/src/lib/admin/auth";
import type { VehicleStatus } from "@/src/lib/vehicles/status";

const BUCKET = "vehicle-images";

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

export type VehicleFormData = {
  owner_id: string;
  brand: string;
  model: string;
  version?: string;
  year?: number | null;
  plate?: string;
  vin?: string;
  color?: string;
  mileage: number;
  status: VehicleStatus;
};

async function syncPrimaryImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleId: string
) {
  const { data: images } = await supabase
    .from("vehicle_images")
    .select("id, image_url, is_primary")
    .eq("vehicle_id", vehicleId)
    .order("created_at", { ascending: true });

  if (!images?.length) {
    await supabase
      .from("vehicles")
      .update({ image_url: null, updated_at: new Date().toISOString() })
      .eq("id", vehicleId);
    return;
  }

  const primary = images.find((img) => img.is_primary) ?? images[0];

  if (!primary.is_primary) {
    await supabase
      .from("vehicle_images")
      .update({ is_primary: false })
      .eq("vehicle_id", vehicleId);

    await supabase
      .from("vehicle_images")
      .update({ is_primary: true })
      .eq("id", primary.id);
  }

  await supabase
    .from("vehicles")
    .update({
      image_url: primary.image_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);
}

function revalidateVehiclePaths(vehicleId?: string) {
  revalidatePath("/admin/vehicules");
  if (vehicleId) {
    revalidatePath(`/admin/vehicules/${vehicleId}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/proprietaires");
  revalidatePath("/espace-proprietaire");
}

export async function createVehicle(
  data: VehicleFormData
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .insert({
      owner_id: data.owner_id,
      brand: data.brand.trim(),
      model: data.model.trim(),
      version: data.version?.trim() || null,
      year: data.year ?? null,
      plate: data.plate?.trim() || null,
      vin: data.vin?.trim() || null,
      color: data.color?.trim() || null,
      mileage: data.mileage,
      status: data.status,
    })
    .select("id")
    .single();

  if (error || !vehicle) {
    return { success: false, error: error?.message ?? "Création impossible" };
  }

  revalidateVehiclePaths(vehicle.id);
  return { success: true, id: vehicle.id };
}

export async function updateVehicle(
  vehicleId: string,
  data: VehicleFormData
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update({
      owner_id: data.owner_id,
      brand: data.brand.trim(),
      model: data.model.trim(),
      version: data.version?.trim() || null,
      year: data.year ?? null,
      plate: data.plate?.trim() || null,
      vin: data.vin?.trim() || null,
      color: data.color?.trim() || null,
      mileage: data.mileage,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateVehiclePaths(vehicleId);
  return { success: true, id: vehicleId };
}

export async function updateOwnerVehicleDetails(
  vehicleId: string,
  data: {
    year?: number | null;
    plate?: string;
    initial_mileage: number | null;
  }
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  if (data.initial_mileage != null && data.initial_mileage < 0) {
    return { success: false, error: "Kilométrage invalide" };
  }

  const payload: Record<string, unknown> = {
    year: data.year ?? null,
    plate: data.plate?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (data.initial_mileage != null) {
    payload.initial_mileage = data.initial_mileage;
  } else {
    payload.initial_mileage = null;
  }

  const { error } = await supabase
    .from("vehicles")
    .update(payload)
    .eq("id", vehicleId);

  if (error) {
    if (error.message.includes("initial_mileage")) {
      const { error: fallbackError } = await supabase
        .from("vehicles")
        .update({
          year: data.year ?? null,
          plate: data.plate?.trim() || null,
          mileage: data.initial_mileage ?? 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicleId);

      if (fallbackError) {
        return { success: false, error: fallbackError.message };
      }
    } else {
      return { success: false, error: error.message };
    }
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("owner_id")
    .eq("id", vehicleId)
    .single();

  revalidateVehiclePaths(vehicleId);
  if (vehicle?.owner_id) {
    revalidatePath(`/admin/proprietaires/${vehicle.owner_id}`);
  }
  revalidatePath("/espace-proprietaire");

  return { success: true, id: vehicleId };
}

export async function deactivateVehicle(vehicleId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update({
      status: "unavailable",
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateVehiclePaths(vehicleId);
  return { success: true };
}

export async function uploadVehiclePhoto(
  vehicleId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Fichier invalide" };
  }

  const admin = createAdminClient();
  const supabase = await createClient();

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${vehicleId}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: existing } = await supabase
    .from("vehicle_images")
    .select("id")
    .eq("vehicle_id", vehicleId);

  const isFirst = !existing?.length;

  const { error: insertError } = await supabase.from("vehicle_images").insert({
    vehicle_id: vehicleId,
    image_url: storagePath,
    is_primary: isFirst,
  });

  if (insertError) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    return { success: false, error: insertError.message };
  }

  if (isFirst) {
    await supabase
      .from("vehicles")
      .update({
        image_url: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);
  }

  revalidateVehiclePaths(vehicleId);
  return { success: true };
}

export async function setVehiclePrimaryPhoto(
  vehicleId: string,
  imageId: string,
  imagePath: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  if (imageId.startsWith("legacy-")) {
    const { error } = await supabase
      .from("vehicles")
      .update({
        image_url: imagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);

    if (error) return { success: false, error: error.message };
    revalidateVehiclePaths(vehicleId);
    return { success: true };
  }

  await supabase
    .from("vehicle_images")
    .update({ is_primary: false })
    .eq("vehicle_id", vehicleId);

  const { error } = await supabase
    .from("vehicle_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase
    .from("vehicles")
    .update({
      image_url: imagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  revalidateVehiclePaths(vehicleId);
  return { success: true };
}

export async function deleteVehiclePhoto(
  vehicleId: string,
  imageId: string,
  imagePath: string
): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const supabase = await createClient();

  if (!imageId.startsWith("legacy-")) {
    const { error } = await supabase
      .from("vehicle_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  await admin.storage.from(BUCKET).remove([imagePath]);

  if (imageId.startsWith("legacy-")) {
    await supabase
      .from("vehicles")
      .update({
        image_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);
  } else {
    await syncPrimaryImage(supabase, vehicleId);
  }

  revalidateVehiclePaths(vehicleId);
  return { success: true };
}
