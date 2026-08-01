"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { requireAdmin } from "@/src/lib/admin/auth";
import type { OwnerFormData } from "@/src/lib/admin/owners-types";

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

function revalidateOwnerPaths(ownerId?: string) {
  revalidatePath("/admin/proprietaires");
  revalidatePath("/admin");
  revalidatePath("/admin/vehicules");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/documents");
  revalidatePath("/admin/maintenance");
  revalidatePath("/vehicules");
  revalidatePath("/espace-proprietaire");
  if (ownerId) {
    revalidatePath(`/admin/proprietaires/${ownerId}`);
  }
}

const VEHICLE_IMAGES_BUCKET = "vehicle-images";

async function deleteOwnerRelatedData(
  admin: ReturnType<typeof createAdminClient>,
  ownerId: string
) {
  const { data: owner, error: ownerError } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", ownerId)
    .maybeSingle();

  if (ownerError) {
    throw new Error(ownerError.message);
  }

  if (!owner) {
    throw new Error("Propriétaire introuvable");
  }

  if (owner.role !== "owner") {
    throw new Error("Seuls les comptes propriétaires peuvent être supprimés");
  }

  const { data: vehicles, error: vehiclesError } = await admin
    .from("vehicles")
    .select("id, image_url")
    .eq("owner_id", ownerId);

  if (vehiclesError) {
    throw new Error(vehiclesError.message);
  }

  const vehicleIds = (vehicles ?? []).map((vehicle) => vehicle.id);
  const storagePaths = new Set<string>();

  for (const vehicle of vehicles ?? []) {
    if (vehicle.image_url?.trim()) {
      storagePaths.add(vehicle.image_url.trim());
    }
  }

  if (vehicleIds.length > 0) {
    const { data: images } = await admin
      .from("vehicle_images")
      .select("image_url")
      .in("vehicle_id", vehicleIds);

    for (const image of images ?? []) {
      if (image.image_url?.trim()) {
        storagePaths.add(image.image_url.trim());
      }
    }

    const tables = [
      "reservations",
      "maintenance",
      "documents",
      "vehicle_images",
    ] as const;

    for (const table of tables) {
      const { error } = await admin.from(table).delete().in("vehicle_id", vehicleIds);
      if (error && !error.message.includes("Could not find the table")) {
        throw new Error(`${table} : ${error.message}`);
      }
    }

    const { error: vehiclesDeleteError } = await admin
      .from("vehicles")
      .delete()
      .eq("owner_id", ownerId);

    if (vehiclesDeleteError) {
      throw new Error(vehiclesDeleteError.message);
    }
  }

  if (storagePaths.size > 0) {
    const paths = [...storagePaths];
    const { error: storageError } = await admin.storage
      .from(VEHICLE_IMAGES_BUCKET)
      .remove(paths);

    if (storageError && !storageError.message.includes("not found")) {
      console.warn("[deleteOwnerAccount] Storage:", storageError.message);
    }
  }

  const ownerTables = ["owner_payouts", "notifications"] as const;

  for (const table of ownerTables) {
    const column = table === "owner_payouts" ? "owner_id" : "profile_id";
    const { error } = await admin.from(table).delete().eq(column, ownerId);
    if (error && !error.message.includes("Could not find the table")) {
      throw new Error(`${table} : ${error.message}`);
    }
  }

  const { error: profileDeleteError } = await admin
    .from("profiles")
    .delete()
    .eq("id", ownerId)
    .eq("role", "owner");

  if (profileDeleteError) {
    throw new Error(profileDeleteError.message);
  }

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(ownerId);

  if (authDeleteError) {
    throw new Error(authDeleteError.message);
  }
}

function validateOwnerForm(data: OwnerFormData): string | null {
  const email = data.email.trim().toLowerCase();
  if (!email) return "Email requis";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email invalide";
  }
  if (!data.password || data.password.length < 8) {
    return "Mot de passe requis (8 caractères minimum)";
  }
  return null;
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw new Error(error.message);
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );
    if (match) return match;

    if (data.users.length < 1000) return null;
    page += 1;
  }
}

export async function createOwnerAccount(
  data: OwnerFormData
): Promise<ActionResult> {
  await requireAdmin();

  const validationError = validateOwnerForm(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const email = data.email.trim().toLowerCase();
  const firstName = data.first_name.trim();
  const lastName = data.last_name.trim();
  const phone = data.phone.trim() || null;

  try {
    const admin = createAdminClient();
    const existingUser = await findAuthUserByEmail(email);

    if (existingUser) {
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", existingUser.id)
        .maybeSingle();

      if (existingProfile?.role === "owner") {
        return {
          success: false,
          error: "Un compte propriétaire existe déjà avec cet email.",
        };
      }

      if (existingProfile?.role === "admin") {
        return {
          success: false,
          error: "Cet email est déjà utilisé par un compte administrateur.",
        };
      }

      return {
        success: false,
        error: "Un compte existe déjà avec cet email.",
      };
    }

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (createError || !created.user) {
      return {
        success: false,
        error: createError?.message ?? "Impossible de créer le compte",
      };
    }

    const ownerId = created.user.id;

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: ownerId,
        first_name: firstName || null,
        last_name: lastName || null,
        phone,
        role: "owner",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      await admin.auth.admin.deleteUser(ownerId);
      return {
        success: false,
        error: `Profil propriétaire impossible : ${profileError.message}`,
      };
    }

    revalidateOwnerPaths(ownerId);
    return { success: true, id: ownerId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue";
    return { success: false, error: message };
  }
}

export async function updateOwnerProfile(
  ownerId: string,
  data: {
    first_name: string;
    last_name: string;
    phone: string;
  }
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      phone: data.phone.trim() || null,
    })
    .eq("id", ownerId)
    .eq("role", "owner");

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateOwnerPaths(ownerId);

  return { success: true };
}

export async function setOwnerAccountActive(
  ownerId: string,
  active: boolean
): Promise<ActionResult> {
  await requireAdmin();

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(ownerId, {
    ban_duration: active ? "none" : "876000h",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateOwnerPaths(ownerId);

  return { success: true };
}

export async function deleteOwnerAccount(ownerId: string): Promise<ActionResult> {
  await requireAdmin();

  if (!ownerId.trim()) {
    return { success: false, error: "Propriétaire introuvable" };
  }

  try {
    const admin = createAdminClient();
    await deleteOwnerRelatedData(admin, ownerId);
    revalidateOwnerPaths();
    return { success: true, id: ownerId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue";
    return { success: false, error: message };
  }
}