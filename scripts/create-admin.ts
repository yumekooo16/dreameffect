/**
 * Crée le premier compte administrateur DreamEffect via l'API Admin Supabase.
 *
 * Usage :
 *   npm run create-admin
 *
 * Prérequis :
 *   - Variables dans .env.local (voir create-admin.env.example)
 *   - SUPABASE_SERVICE_ROLE_KEY (Dashboard → Settings → API)
 *
 * Le script est idempotent : relancer ne provoque pas d'erreur si le compte existe.
 */

import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { loadAdminSeedConfig } from "./create-admin.config";

const PAGE_SIZE = 1000;

async function findUserByEmail(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
): Promise<User | null> {
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      throw new Error(`Impossible de lister les utilisateurs : ${error.message}`);
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );
    if (match) return match;

    if (data.users.length < PAGE_SIZE) return null;
    page += 1;
  }
}

async function ensureProfile(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  firstName: string,
  lastName: string
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      role: "admin",
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`Impossible de créer/mettre à jour le profil : ${error.message}`);
  }
}

async function verifyAdminAccount(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  expectedEmail: string
) {
  const { data: authData, error: authError } =
    await supabase.auth.admin.getUserById(userId);

  if (authError || !authData.user) {
    throw new Error(
      `Vérification auth échouée : ${authError?.message ?? "utilisateur introuvable"}`
    );
  }

  const user = authData.user;

  if (user.email?.toLowerCase() !== expectedEmail.toLowerCase()) {
    throw new Error("L'email de l'utilisateur ne correspond pas à la configuration.");
  }

  if (!user.email_confirmed_at) {
    throw new Error("L'email n'est pas confirmé.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(
      `Profil introuvable : ${profileError?.message ?? "aucune ligne"}`
    );
  }

  if (profile.role !== "admin") {
    throw new Error(`Le rôle du profil est "${profile.role}" au lieu de "admin".`);
  }

  return { user, profile };
}

async function main() {
  const seed = loadAdminSeedConfig();
  const supabase = createAdminClient();

  console.log("DreamEffect — création du compte administrateur\n");
  console.log(`Email cible : ${seed.email}`);

  let user = await findUserByEmail(supabase, seed.email);
  let created = false;

  if (user) {
    console.log("\nℹ️  Le compte existe déjà dans auth.users — mise à jour du profil admin.");

    const { data: updated, error: updateError } =
      await supabase.auth.admin.updateUserById(user.id, {
        password: seed.password,
        email_confirm: true,
        user_metadata: {
          first_name: seed.firstName,
          last_name: seed.lastName,
        },
      });

    if (updateError) {
      throw new Error(`Mise à jour du compte échouée : ${updateError.message}`);
    }

    if (updated.user) {
      user = updated.user;
    }

    console.log("✓ Mot de passe synchronisé avec ADMIN_PASSWORD (.env.local)");
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: seed.email,
      password: seed.password,
      email_confirm: true,
      user_metadata: {
        first_name: seed.firstName,
        last_name: seed.lastName,
      },
    });

    if (error) {
      throw new Error(`Création du compte échouée : ${error.message}`);
    }

    if (!data.user) {
      throw new Error("Création du compte échouée : aucun utilisateur retourné.");
    }

    user = data.user;
    created = true;
    console.log("\n✅ Compte administrateur créé dans auth.users.");
  }

  await ensureProfile(supabase, user.id, seed.firstName, seed.lastName);

  const { user: verifiedUser, profile } = await verifyAdminAccount(
    supabase,
    user.id,
    seed.email
  );

  console.log("\n--- Vérifications ---");
  console.log(`✓ auth.users     : ${verifiedUser.email} (${verifiedUser.id})`);
  console.log(`✓ Email confirmé : ${verifiedUser.email_confirmed_at}`);
  console.log(`✓ profiles       : ${profile.first_name} ${profile.last_name}`);
  console.log(`✓ Rôle           : ${profile.role}`);

  if (created) {
    console.log("\n🎉 Succès — le compte administrateur a été créé et vérifié.");
  } else {
    console.log(
      "\n🎉 Succès — le compte existait déjà ; profil admin vérifié/mis à jour."
    );
  }

  console.log("\nConnexion : /login → redirection automatique vers /admin");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ Échec : ${message}`);
  process.exit(1);
});
