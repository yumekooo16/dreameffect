import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserSession } from "@/src/lib/auth/profile";
import { redirectPathForRole } from "@/src/lib/auth/redirects";

export async function requireAdmin() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  if (session.profile.role !== "admin") {
    redirect(redirectPathForRole(session.profile.role));
  }

  const supabase = await createClient();

  return { user: session.user, profile: session.profile, supabase };
}
