import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/src/lib/supabase/env";

/** Client navigateur standard (singleton, flux PKCE). */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}

/**
 * Client dédié au callback d'invitation.
 * inviteUserByEmail renvoie un hash implicite (#access_token=…) ;
 * @supabase/ssr force flowType=pkce et refuse ce hash via detectSessionInUrl.
 * On désactive la détection auto et on appelle setSession manuellement.
 */
export function createAuthCallbackClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    isSingleton: false,
    auth: {
      detectSessionInUrl: false,
      flowType: "implicit", // écrasé en pkce par ssr — setSession manuel ensuite
    },
  });
}
