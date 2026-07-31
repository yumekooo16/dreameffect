import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { getUserSession } from "@/src/lib/auth/profile";

export async function requireOwner() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  if (session.profile.role === "admin") {
    redirect("/admin");
  }

  if (session.profile.role !== "owner") {
    redirect("/login");
  }

  const supabase = await createClient();

  return { ...session, supabase };
}
