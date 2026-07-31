import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { redirectPathForRole } from "@/src/lib/auth/redirects";

export default async function RedirectPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(redirectPathForRole(profile?.role));
}
