import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/src/lib/supabase/env";

function getServiceRoleKey(): string {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!raw) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY est manquante. Définissez-la dans .env.local (jamais côté client)."
    );
  }
  return raw.split(/\s+/)[0];
}

/**
 * Client Supabase Admin (Service Role).
 *
 * ⚠️ Serveur / scripts uniquement — ne jamais importer depuis un composant
 * client ou une page Next.js exposée au navigateur.
 */
export function createAdminClient() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
