import { cache } from "react";
import { createClient } from "@/src/lib/supabase/server";
import { getAuthUser } from "@/src/lib/auth";

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
};

export const getUserSession = cache(async () => {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { user, profile: profile as UserProfile };
});
