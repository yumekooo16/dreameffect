import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase Admin (Service Role).
 *
 * ⚠️ Serveur / scripts uniquement — ne jamais importer depuis un composant
 * client ou une page Next.js exposée au navigateur.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL est manquante. Définissez-la dans .env.local."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY est manquante. Définissez-la dans .env.local (jamais côté client)."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
