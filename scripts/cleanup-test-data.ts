/**
 * Supprime les utilisateurs test et toutes les données métier,
 * en conservant uniquement le compte admin@dreameffect.fr.
 *
 * Usage :
 *   npm run cleanup-test-data -- --confirm
 *
 * Sans --confirm : affiche un aperçu sans rien supprimer.
 */

import { config } from "dotenv";
import { resolve } from "node:path";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/src/lib/supabase/admin";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const KEEP_ADMIN_EMAIL = "admin@dreameffect.fr";
const VEHICLE_IMAGES_BUCKET = "vehicle-images";
const PAGE_SIZE = 1000;

async function listAllAuthUsers(
  supabase: ReturnType<typeof createAdminClient>
): Promise<User[]> {
  const users: User[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      throw new Error(`Impossible de lister les utilisateurs : ${error.message}`);
    }

    users.push(...data.users);
    if (data.users.length < PAGE_SIZE) break;
    page += 1;
  }

  return users;
}

async function countRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: string
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return null;
    }
    throw new Error(`Impossible de compter ${table} : ${error.message}`);
  }

  return count ?? 0;
}

async function deleteAllRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: string
): Promise<"deleted" | "skipped"> {
  const { error } = await supabase
    .from(table)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return "skipped";
    }
    throw new Error(`Impossible de vider ${table} : ${error.message}`);
  }

  return "deleted";
}

async function deleteProfilesExcept(
  supabase: ReturnType<typeof createAdminClient>,
  adminId: string
) {
  const { error } = await supabase.from("profiles").delete().neq("id", adminId);

  if (error) {
    throw new Error(`Impossible de supprimer les profils test : ${error.message}`);
  }
}

async function emptyStorageBucket(
  supabase: ReturnType<typeof createAdminClient>,
  bucket: string
) {
  const paths: string[] = [];
  const queue = [""];

  while (queue.length > 0) {
    const prefix = queue.pop() ?? "";
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
    });

    if (error) {
      if (
        error.message.includes("Bucket not found") ||
        error.message.includes("not found")
      ) {
        return 0;
      }
      throw new Error(`Impossible de lister le bucket ${bucket} : ${error.message}`);
    }

    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id == null) {
        queue.push(path);
      } else {
        paths.push(path);
      }
    }
  }

  if (paths.length === 0) return 0;

  const chunkSize = 100;
  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize);
    const { error } = await supabase.storage.from(bucket).remove(chunk);
    if (error) {
      throw new Error(
        `Impossible de supprimer des fichiers dans ${bucket} : ${error.message}`
      );
    }
  }

  return paths.length;
}

async function preview(
  supabase: ReturnType<typeof createAdminClient>,
  adminId: string,
  usersToDelete: User[]
) {
  const tables = [
    "automation_sent",
    "audit_log",
    "notifications",
    "reservations",
    "maintenance",
    "documents",
    "vehicle_images",
    "owner_payouts",
    "vehicles",
  ] as const;

  const counts: Record<string, number | null> = {};
  for (const table of tables) {
    counts[table] = await countRows(supabase, table);
  }

  const { count: profileCount, error: profileError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .neq("id", adminId);

  if (profileError) {
    throw new Error(`Impossible de compter les profils test : ${profileError.message}`);
  }

  console.log("\n--- Aperçu ---");
  console.log(`Admin conservé : ${KEEP_ADMIN_EMAIL} (${adminId})`);
  console.log("\nDonnées à supprimer :");
  for (const table of tables) {
    const count = counts[table];
    console.log(
      `  - ${table}: ${count == null ? "(table absente, ignorée)" : count}`
    );
  }
  console.log(`  - profiles (hors admin): ${profileCount ?? 0}`);
  console.log(`  - auth.users test: ${usersToDelete.length}`);
  console.log(`  - storage/${VEHICLE_IMAGES_BUCKET}: tous les fichiers`);

  if (usersToDelete.length > 0) {
    console.log("\nComptes auth à supprimer :");
    for (const user of usersToDelete) {
      console.log(`  - ${user.email ?? user.id}`);
    }
  }
}

async function main() {
  const confirmed = process.argv.includes("--confirm");
  const supabase = createAdminClient();

  console.log("DreamEffect — nettoyage des données test");
  console.log(`Compte conservé : ${KEEP_ADMIN_EMAIL}`);

  const users = await listAllAuthUsers(supabase);
  const adminUser = users.find(
    (user) => user.email?.toLowerCase() === KEEP_ADMIN_EMAIL.toLowerCase()
  );

  if (!adminUser) {
    throw new Error(
      `Le compte admin ${KEEP_ADMIN_EMAIL} est introuvable. Créez-le avec npm run create-admin.`
    );
  }

  const usersToDelete = users.filter((user) => user.id !== adminUser.id);

  await preview(supabase, adminUser.id, usersToDelete);

  if (!confirmed) {
    console.log(
      "\nAucune suppression effectuée.\nRelancez avec --confirm pour exécuter le nettoyage."
    );
    return;
  }

  console.log("\n--- Suppression en cours ---");

  const steps: Array<[string, () => Promise<number | "skipped" | void>]> = [
    ["automation_sent", () => deleteAllRows(supabase, "automation_sent")],
    ["audit_log", () => deleteAllRows(supabase, "audit_log")],
    ["notifications", () => deleteAllRows(supabase, "notifications")],
    ["reservations", () => deleteAllRows(supabase, "reservations")],
    ["maintenance", () => deleteAllRows(supabase, "maintenance")],
    ["documents", () => deleteAllRows(supabase, "documents")],
    ["vehicle_images", () => deleteAllRows(supabase, "vehicle_images")],
    ["owner_payouts", () => deleteAllRows(supabase, "owner_payouts")],
    ["vehicles", () => deleteAllRows(supabase, "vehicles")],
    [
      `storage/${VEHICLE_IMAGES_BUCKET}`,
      () => emptyStorageBucket(supabase, VEHICLE_IMAGES_BUCKET),
    ],
    ["profiles (hors admin)", () => deleteProfilesExcept(supabase, adminUser.id)],
  ];

  for (const [label, action] of steps) {
    const result = await action();
    if (typeof result === "number") {
      console.log(`✓ ${label} (${result} fichier(s) supprimé(s))`);
    } else if (result === "skipped") {
      console.log(`○ ${label} (table absente, ignorée)`);
    } else {
      console.log(`✓ ${label}`);
    }
  }

  for (const user of usersToDelete) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      throw new Error(
        `Impossible de supprimer ${user.email ?? user.id} : ${error.message}`
      );
    }
    console.log(`✓ auth.users : ${user.email ?? user.id}`);
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name")
    .eq("id", adminUser.id)
    .single();

  if (adminProfileError || !adminProfile) {
    throw new Error("Le profil admin a disparu après nettoyage.");
  }

  if (adminProfile.role !== "admin") {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", adminUser.id);
    if (error) {
      throw new Error(`Impossible de restaurer le rôle admin : ${error.message}`);
    }
    console.log("✓ Rôle admin restauré sur le profil conservé");
  }

  console.log("\n🎉 Nettoyage terminé.");
  console.log(`Seul ${KEEP_ADMIN_EMAIL} reste actif, avec un tableau de bord vide.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ Échec : ${message}`);
  process.exit(1);
});
