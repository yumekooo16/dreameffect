"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { requireAdmin } from "@/src/lib/admin/auth";
import { ensureUniqueVehicleSlug } from "@/src/lib/admin/vehicle-slug";
import type { VehicleStatus } from "@/src/lib/vehicles/status";
import type { FuelType, TransmissionType } from "@/src/lib/vehicles/catalog-fields";
import {
  deriveDailyRate,
  normalizeVehiclePricing,
  type VehiclePricing,
} from "@/src/lib/vehicles/pricing";
import { isMissingColumnError } from "@/src/lib/vehicles/db-columns";

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
  pricing?: Partial<VehiclePricing>;
  fuel?: FuelType | "";
  transmission?: TransmissionType | "";
  power?: number | null;
  location?: string;
  description?: string;
  is_published?: boolean;
};

function pricingPayload(data: VehicleFormData) {
  return normalizeVehiclePricing(data.pricing);
}

function catalogPayload(data: VehicleFormData) {
  const pricing = pricingPayload(data);

  return {
    ...pricing,
    daily_rate: deriveDailyRate(pricing),
    fuel: data.fuel?.trim() || null,
    transmission: data.transmission?.trim() || null,
    power: data.power != null && data.power > 0 ? data.power : null,
    location: data.location?.trim() || null,
    description: data.description?.trim() || null,
    is_published: data.is_published ?? true,
  };
}

function coreVehiclePayload(data: VehicleFormData) {
  return {
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
  };
}

function revalidateVehiclePaths(vehicleId?: string, slug?: string | null) {
  revalidatePath("/admin/vehicules");
  if (vehicleId) {
    revalidatePath(`/admin/vehicules/${vehicleId}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/proprietaires");
  revalidatePath("/espace-proprietaire");
  revalidatePath("/");
  revalidatePath("/vehicules");
  if (slug) {
    revalidatePath(`/vehicules/${slug}`);
  }
}

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

export async function createVehicle(
  data: VehicleFormData
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const slug = await ensureUniqueVehicleSlug(
    supabase,
    data.brand.trim(),
    data.model.trim(),
    data.version?.trim() || null
  );

  let insertResult = await supabase
    .from("vehicles")
    .insert({
      ...coreVehiclePayload(data),
      slug,
      ...catalogPayload(data),
    })
    .select("id")
    .single();

  if (insertResult.error && isMissingColumnError(insertResult.error.message)) {
    insertResult = await supabase
      .from("vehicles")
      .insert({
        ...coreVehiclePayload(data),
        ...pricingPayload(data),
      })
      .select("id")
      .single();
  }

  const vehicle = insertResult.data;
  const error = insertResult.error;

  if (error || !vehicle) {
    return { success: false, error: error?.message ?? "Création impossible" };
  }

  revalidateVehiclePaths(vehicle.id, slug);
  return { success: true, id: vehicle.id };
}

export async function updateVehicle(
  vehicleId: string,
  data: VehicleFormData
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("vehicles")
    .select("slug, brand, model, version")
    .eq("id", vehicleId)
    .single();

  const brandChanged =
    existing?.brand !== data.brand.trim() ||
    existing?.model !== data.model.trim() ||
    (existing?.version ?? "") !== (data.version?.trim() ?? "");

  const slug =
    brandChanged || !existing?.slug
      ? await ensureUniqueVehicleSlug(
          supabase,
          data.brand.trim(),
          data.model.trim(),
          data.version?.trim() || null,
          vehicleId
        )
      : existing.slug;

  let updateResult = await supabase
    .from("vehicles")
    .update({
      ...coreVehiclePayload(data),
      slug,
      ...catalogPayload(data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (updateResult.error && isMissingColumnError(updateResult.error.message)) {
    updateResult = await supabase
      .from("vehicles")
      .update({
        ...coreVehiclePayload(data),
        ...pricingPayload(data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);
  }

  const { error } = updateResult;

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateVehiclePaths(vehicleId, slug);
  if (existing?.slug && existing.slug !== slug) {
    revalidatePath(`/vehicules/${existing.slug}`);
  }
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

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("public_image_url")
    .eq("id", vehicleId)
    .maybeSingle();

  if (vehicle?.public_image_url?.trim() === imagePath) {
    await supabase
      .from("vehicles")
      .update({
        public_image_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);
  }

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

export async function setVehiclePublicPhoto(
  vehicleId: string,
  imagePath: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update({
      public_image_url: imagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (error) {
    if (isMissingColumnError(error.message)) {
      return {
        success: false,
        error:
          "Colonne public_image_url absente — exécutez la migration SQL 20260731220000_vehicle_public_image.sql",
      };
    }
    return { success: false, error: error.message };
  }

  revalidateVehiclePaths(vehicleId);
  return { success: true };
}

export async function clearVehiclePublicPhoto(
  vehicleId: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update({
      public_image_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (error) {
    if (isMissingColumnError(error.message)) {
      return {
        success: false,
        error:
          "Colonne public_image_url absente — exécutez la migration SQL 20260731220000_vehicle_public_image.sql",
      };
    }
    return { success: false, error: error.message };
  }

  revalidateVehiclePaths(vehicleId);
  return { success: true };
}

export async function uploadVehicleHeroImage(
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

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const storagePath = `${vehicleId}/hero-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: existingVehicle } = await supabase
    .from("vehicles")
    .select("hero_image_url")
    .eq("id", vehicleId)
    .maybeSingle();

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "image/png",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({
      hero_image_url: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (updateError) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    if (isMissingColumnError(updateError.message)) {
      return {
        success: false,
        error:
          "Colonne hero_image_url absente — exécutez la migration SQL 20260731200000_vehicle_hero_image.sql",
      };
    }
    return { success: false, error: updateError.message };
  }

  const previousPath = existingVehicle?.hero_image_url?.trim();
  if (previousPath && previousPath !== storagePath) {
    await admin.storage.from(BUCKET).remove([previousPath]);
  }

  revalidateVehiclePaths(vehicleId);
  return { success: true };
}

export async function deleteVehicleHeroImage(
  vehicleId: string
): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("hero_image_url")
    .eq("id", vehicleId)
    .maybeSingle();

  const heroPath = vehicle?.hero_image_url?.trim();
  if (!heroPath) {
    return { success: false, error: "Aucune image hero à supprimer" };
  }

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({
      hero_image_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await admin.storage.from(BUCKET).remove([heroPath]);
  revalidateVehiclePaths(vehicleId);
  return { success: true };
}
