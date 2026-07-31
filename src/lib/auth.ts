import { cache } from "react";
import { createClient } from "@/src/lib/supabase/server";

/** Évite les appels auth dupliqués dans une même requête serveur. */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
