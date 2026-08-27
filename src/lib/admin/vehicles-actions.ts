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
import {
  normalizeVehicleProPricing,
  type VehicleProPricing,
} from "@/src/lib/revenue/pro-pricing";
import { isMissingColumnError } from "@/src/lib/vehicles/db-columns";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  MAX_VEHICLE_PHOTOS,
  frameFromImageColumns,
  imageFrameToColumns,
  normalizeVehicleImageFrame,
  type VehicleImageFrame,
} from "@/src/lib/vehicles/image-frame";

const BUCKET = "vehicle-images";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

function sanitizeImageExtension(fileName: string, mimeType?: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ALLOWED_EXTENSIONS.has(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  if (mimeType?.includes("png")) return "png";
  if (mimeType?.includes("webp")) return "webp";
  if (mimeType?.includes("gif")) return "gif";
  return "jpg";
}

function isUploadableImage(value: FormDataEntryValue | null): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    value.size > 0 &&
    (value.type.startsWith("image/") || Boolean(value.name))
  );
}

function mapUploadFailure(error: unknown, fallback: string): string {
  const message =
    error instanceof Error
      ? error.message.trim()
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message.trim()
        : "";

  if (!message) return fallback;

  if (/bucket|not found|No such/i.test(message)) {
    return "Bucket Storage « vehicle-images » introuvable ou inaccessible. Vérifiez Supabase Storage.";
  }
  if (/row-level security|RLS|permission|policy/i.test(message)) {
    return "Permission refusée (RLS). Vérifiez les politiques Storage / vehicle_images.";
  }
  return message;
}

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
  proPricing?: Partial<VehicleProPricing>;
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

function proPricingPayload(data: VehicleFormData) {
  return normalizeVehicleProPricing(data.proPricing);
}

function catalogPayload(data: VehicleFormData) {
  const pricing = pricingPayload(data);
  const proPricing = proPricingPayload(data);

  return {
    ...pricing,
    ...proPricing,
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
  const withOrder = await supabase
    .from("vehicle_images")
    .select("id, image_url, is_primary, sort_order, created_at")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const images =
    !withOrder.error && withOrder.data
      ? withOrder.data
      : (
          await supabase
            .from("vehicle_images")
            .select("id, image_url, is_primary, created_at")
            .eq("vehicle_id", vehicleId)
            .order("created_at", { ascending: true })
        ).data;

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
  try {
    await requireAdmin();

    const file = formData.get("file");

    if (!isUploadableImage(file)) {
      return { success: false, error: "Fichier invalide ou format non supporté" };
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return { success: false, error: "Photo trop lourde (maximum 10 Mo)" };
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("vehicle_images")
      .select("id, sort_order")
      .eq("vehicle_id", vehicleId);

    if ((existing?.length ?? 0) >= MAX_VEHICLE_PHOTOS) {
      return {
        success: false,
        error: `Maximum ${MAX_VEHICLE_PHOTOS} photos par véhicule (pour garder le site fluide).`,
      };
    }

    const extension = sanitizeImageExtension(file.name, file.type);
    const storagePath = `${vehicleId}/${Date.now()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: mapUploadFailure(uploadError, uploadError.message) };
    }

    const isFirst = !existing?.length;
    const nextSortOrder =
      existing && existing.length > 0
        ? Math.max(
            ...existing.map((row) =>
              typeof row.sort_order === "number" ? row.sort_order : 0
            )
          ) + 1
        : 0;

    const insertPayload = {
      vehicle_id: vehicleId,
      image_url: storagePath,
      is_primary: isFirst,
      sort_order: nextSortOrder,
    };

    let { error: insertError } = await admin
      .from("vehicle_images")
      .insert(insertPayload);

    if (insertError && isMissingColumnError(insertError.message)) {
      const legacy = await admin.from("vehicle_images").insert({
        vehicle_id: vehicleId,
        image_url: storagePath,
        is_primary: isFirst,
      });
      insertError = legacy.error;
    }

    if (insertError) {
      await admin.storage.from(BUCKET).remove([storagePath]);
      return {
        success: false,
        error: mapUploadFailure(insertError, insertError.message),
      };
    }

    if (isFirst) {
      await admin
        .from("vehicles")
        .update({
          image_url: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicleId);
    }

    revalidateVehiclePaths(vehicleId);
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[uploadVehiclePhoto]", error);
    return {
      success: false,
      error: mapUploadFailure(error, "Impossible d'ajouter la photo pour le moment"),
    };
  }
}

export async function moveVehiclePhoto(
  vehicleId: string,
  imageId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireAdmin();

  if (imageId.startsWith("legacy-")) {
    return {
      success: false,
      error: "Ajoutez d'abord les photos via la galerie pour pouvoir les réordonner.",
    };
  }

  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("vehicle_images")
    .select("id, sort_order, created_at")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingColumnError(error.message)) {
      return {
        success: false,
        error:
          "Colonne sort_order absente. Exécutez la migration SQL vehicle_images_sort_order sur Supabase.",
      };
    }
    return { success: false, error: error.message };
  }

  if (!rows?.length) {
    return { success: false, error: "Aucune photo à réordonner" };
  }

  const ordered = [...rows].sort((a, b) => {
    const orderA = typeof a.sort_order === "number" ? a.sort_order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.sort_order === "number" ? b.sort_order : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""));
  });

  const index = ordered.findIndex((row) => row.id === imageId);
  if (index < 0) {
    return { success: false, error: "Photo introuvable" };
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ordered.length) {
    return { success: true };
  }

  const reordered = [...ordered];
  const current = reordered[index]!;
  reordered[index] = reordered[swapIndex]!;
  reordered[swapIndex] = current;

  for (let i = 0; i < reordered.length; i += 1) {
    const { error: updateError } = await admin
      .from("vehicle_images")
      .update({ sort_order: i })
      .eq("id", reordered[i]!.id)
      .eq("vehicle_id", vehicleId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
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
  const admin = createAdminClient();

  const { data: imageRow } = await admin
    .from("vehicle_images")
    .select(
      "image_fit, image_position_x, image_position_y, image_scale"
    )
    .eq("vehicle_id", vehicleId)
    .eq("image_url", imagePath)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    public_image_url: imagePath,
    updated_at: new Date().toISOString(),
  };

  if (imageRow) {
    const frame = frameFromImageColumns(imageRow);
    payload.public_image_fit = frame.fit;
    payload.public_image_position_x = frame.positionX;
    payload.public_image_position_y = frame.positionY;
    payload.public_image_scale = frame.scale;
  }

  const { error } = await supabase
    .from("vehicles")
    .update(payload)
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

export async function updateVehiclePublicImageFrame(
  vehicleId: string,
  frameInput: Partial<VehicleImageFrame>
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const frame = normalizeVehicleImageFrame(frameInput);
    const admin = createAdminClient();

    const { error } = await admin
      .from("vehicles")
      .update({
        public_image_fit: frame.fit,
        public_image_position_x: frame.positionX,
        public_image_position_y: frame.positionY,
        public_image_scale: frame.scale,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);

    if (error) {
      if (isMissingColumnError(error.message)) {
        return {
          success: false,
          error:
            "Colonnes de cadrage absentes — exécutez la migration SQL 20260827120000_vehicle_public_image_frame.sql",
        };
      }
      return { success: false, error: mapUploadFailure(error, error.message) };
    }

    revalidateVehiclePaths(vehicleId);
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: mapUploadFailure(error, "Impossible d'enregistrer le cadrage"),
    };
  }
}

export async function updateVehicleImageFrame(
  vehicleId: string,
  imageId: string,
  frameInput: Partial<VehicleImageFrame>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (imageId.startsWith("legacy-")) {
      return updateVehiclePublicImageFrame(vehicleId, frameInput);
    }

    const frame = normalizeVehicleImageFrame(frameInput);
    const admin = createAdminClient();
    const columns = imageFrameToColumns(frame);

    const { data: image, error: fetchError } = await admin
      .from("vehicle_images")
      .select("id, image_url")
      .eq("id", imageId)
      .eq("vehicle_id", vehicleId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }
    if (!image) {
      return { success: false, error: "Photo introuvable" };
    }

    const { error } = await admin
      .from("vehicle_images")
      .update(columns)
      .eq("id", imageId)
      .eq("vehicle_id", vehicleId);

    if (error) {
      if (isMissingColumnError(error.message)) {
        return {
          success: false,
          error:
            "Colonnes de cadrage photo absentes — exécutez la migration SQL vehicle_images_per_image_frame sur Supabase.",
        };
      }
      return { success: false, error: mapUploadFailure(error, error.message) };
    }

    const { data: vehicle } = await admin
      .from("vehicles")
      .select("public_image_url, image_url")
      .eq("id", vehicleId)
      .maybeSingle();

    const coverUrl =
      vehicle?.public_image_url?.trim() || vehicle?.image_url?.trim() || null;
    const isCover = Boolean(coverUrl && image.image_url === coverUrl);

    if (isCover) {
      await admin
        .from("vehicles")
        .update({
          public_image_fit: frame.fit,
          public_image_position_x: frame.positionX,
          public_image_position_y: frame.positionY,
          public_image_scale: frame.scale,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicleId);
    }

    revalidateVehiclePaths(vehicleId);
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: mapUploadFailure(error, "Impossible d'enregistrer le cadrage"),
    };
  }
}

export async function uploadVehicleHeroImage(
  vehicleId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const file = formData.get("file");

    if (!isUploadableImage(file)) {
      return { success: false, error: "Fichier invalide ou format non supporté" };
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return { success: false, error: "Image trop lourde (maximum 10 Mo)" };
    }

    const admin = createAdminClient();

    const extension = sanitizeImageExtension(file.name, file.type);
    const storagePath = `${vehicleId}/hero-${Date.now()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: existingVehicle } = await admin
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
      return { success: false, error: mapUploadFailure(uploadError, uploadError.message) };
    }

    const { error: updateError } = await admin
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
      return {
        success: false,
        error: mapUploadFailure(updateError, updateError.message),
      };
    }

    const previousPath = existingVehicle?.hero_image_url?.trim();
    if (previousPath && previousPath !== storagePath) {
      await admin.storage.from(BUCKET).remove([previousPath]);
    }

    revalidateVehiclePaths(vehicleId);
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[uploadVehicleHeroImage]", error);
    return {
      success: false,
      error: mapUploadFailure(error, "Impossible d'ajouter l'image pour le moment"),
    };
  }
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
