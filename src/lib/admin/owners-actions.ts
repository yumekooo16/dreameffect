"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { requireAdmin } from "@/src/lib/admin/auth";
import type { OwnerFormData } from "@/src/lib/admin/owners-types";
import {
  authCallbackUrl,
  normalizeEmail,
  validateRealOwnerEmail,
} from "@/src/lib/auth/email";

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
  const emailError = validateRealOwnerEmail(data.email);
  if (emailError) return emailError;

  if (data.revenue_mode !== "percentage" && data.revenue_mode !== "pro_price") {
    return "Mode de rémunération invalide";
  }
  if (data.revenue_mode === "percentage") {
    const percent = Number(data.owner_revenue_share_percent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return "Le pourcentage propriétaire doit être entre 0 et 100";
    }
  }
  return null;
}

function revenueFieldsFromForm(data: {
  revenue_mode: OwnerFormData["revenue_mode"];
  owner_revenue_share_percent: number;
}) {
  if (data.revenue_mode === "pro_price") {
    return {
      revenue_mode: "pro_price" as const,
      owner_revenue_share: null as number | null,
    };
  }

  const percent = Number(data.owner_revenue_share_percent);
  const share = Math.round(Math.min(100, Math.max(0, percent)) * 100) / 10000;

  return {
    revenue_mode: "percentage" as const,
    owner_revenue_share: share,
  };
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
): Promise<ActionResult & { invited?: boolean }> {
  await requireAdmin();

  const validationError = validateOwnerForm(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const email = normalizeEmail(data.email);
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

    // Invitation = vrai email + vérification obligatoire (le propriétaire
    // choisit son mot de passe via le lien reçu).
    const { data: invited, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: "owner",
        },
        redirectTo: authCallbackUrl("/espace-proprietaire"),
      });

    if (inviteError || !invited.user) {
      return {
        success: false,
        error:
          inviteError?.message ??
          "Impossible d'envoyer l'invitation. Vérifiez la config email Supabase (SMTP / Auth).",
      };
    }

    const ownerId = invited.user.id;
    const revenueFields = revenueFieldsFromForm(data);

    const profilePayload: Record<string, unknown> = {
      id: ownerId,
      first_name: firstName || null,
      last_name: lastName || null,
      phone,
      email,
      role: "owner",
      ...revenueFields,
    };

    const { error: profileError } = await admin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      // Colonnes absentes (migration non appliquée) → retry progressif
      if (profileError.message.includes("does not exist")) {
        const { error: fallbackError } = await admin.from("profiles").upsert(
          {
            id: ownerId,
            first_name: firstName || null,
            last_name: lastName || null,
            phone,
            role: "owner",
          },
          { onConflict: "id" }
        );

        if (fallbackError) {
          await admin.auth.admin.deleteUser(ownerId);
          return {
            success: false,
            error: `Profil propriétaire impossible : ${fallbackError.message}`,
          };
        }
      } else {
        await admin.auth.admin.deleteUser(ownerId);
        return {
          success: false,
          error: `Profil propriétaire impossible : ${profileError.message}`,
        };
      }
    }

    revalidateOwnerPaths(ownerId);
    return { success: true, id: ownerId, invited: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue";
    return { success: false, error: message };
  }
}

export async function resendOwnerInvite(
  ownerId: string
): Promise<ActionResult & { inviteLink?: string }> {
  await requireAdmin();

  if (!ownerId.trim()) {
    return { success: false, error: "Propriétaire introuvable" };
  }

  const admin = createAdminClient();

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(ownerId);

  if (authError || !authData.user?.email) {
    return {
      success: false,
      error: authError?.message ?? "Email propriétaire introuvable",
    };
  }

  if (authData.user.email_confirmed_at) {
    return {
      success: false,
      error: "Cet email est déjà vérifié — pas besoin de renvoyer l'invitation.",
    };
  }

  const email = normalizeEmail(authData.user.email);
  const redirectTo = authCallbackUrl("/espace-proprietaire");

  // Relance l'email d'invitation (si le projet Auth/SMTP est configuré)
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        first_name: authData.user.user_metadata?.first_name,
        last_name: authData.user.user_metadata?.last_name,
        role: "owner",
      },
      redirectTo,
    }
  );

  if (!inviteError) {
    revalidateOwnerPaths(ownerId);
    return { success: true, id: ownerId };
  }

  // Utilisateur déjà créé : générer un lien à transmettre (email / WhatsApp)
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo },
    });

  if (linkError) {
    return {
      success: false,
      error:
        inviteError.message ||
        linkError.message ||
        "Impossible de renvoyer l'invitation",
    };
  }

  const inviteLink =
    linkData?.properties?.action_link ??
    (linkData as { action_link?: string } | null)?.action_link;

  revalidateOwnerPaths(ownerId);
  return {
    success: true,
    id: ownerId,
    inviteLink: inviteLink || undefined,
  };
}

export async function updateOwnerProfile(
  ownerId: string,
  data: {
    first_name: string;
    last_name: string;
    phone: string;
    revenue_mode: OwnerFormData["revenue_mode"];
    owner_revenue_share_percent: number;
  }
): Promise<ActionResult> {
  await requireAdmin();

  if (data.revenue_mode !== "percentage" && data.revenue_mode !== "pro_price") {
    return { success: false, error: "Mode de rémunération invalide" };
  }

  if (data.revenue_mode === "percentage") {
    const percent = Number(data.owner_revenue_share_percent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return {
        success: false,
        error: "Le pourcentage propriétaire doit être entre 0 et 100",
      };
    }
  }

  const supabase = await createClient();
  const revenueFields = revenueFieldsFromForm(data);

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      phone: data.phone.trim() || null,
      ...revenueFields,
    })
    .eq("id", ownerId)
    .eq("role", "owner");

  if (error) {
    if (error.message.includes("does not exist")) {
      const { error: fallbackError } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          phone: data.phone.trim() || null,
        })
        .eq("id", ownerId)
        .eq("role", "owner");

      if (fallbackError) {
        return { success: false, error: fallbackError.message };
      }

      return {
        success: false,
        error:
          "Migration rémunération non appliquée — exécutez 20260824120000_owner_revenue_modes.sql",
      };
    }

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

  if (!ownerId.trim()) {
    return { success: false, error: "Propriétaire introuvable" };
  }

  const admin = createAdminClient();

  const { data: owner, error: ownerError } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", ownerId)
    .maybeSingle();

  if (ownerError) {
    return { success: false, error: ownerError.message };
  }

  if (!owner || owner.role !== "owner") {
    return {
      success: false,
      error: "Seuls les comptes propriétaires peuvent être activés ou désactivés",
    };
  }

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