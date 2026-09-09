"use server";

import { headers } from "next/headers";
import { createClient } from "@/src/lib/supabase/server";
import { getUserSession } from "@/src/lib/auth/profile";

type ActionResult = { success: boolean; error?: string };

export async function savePushSubscription(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<ActionResult> {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Non connecté" };
  }

  const endpoint = input.endpoint?.trim();
  const p256dh = input.keys?.p256dh?.trim();
  const auth = input.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    return { success: false, error: "Abonnement push invalide" };
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent")?.slice(0, 300) ?? null;

  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      profile_id: session.user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[savePushSubscription]", error.message);
    return {
      success: false,
      error:
        error.message.includes("push_subscriptions") || error.code === "42P01"
          ? "Migration push non appliquée sur Supabase."
          : error.message,
    };
  }

  return { success: true };
}

export async function removePushSubscription(
  endpoint: string
): Promise<ActionResult> {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Non connecté" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("profile_id", session.user.id)
    .eq("endpoint", endpoint.trim());

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getPushSubscriptionStatus(): Promise<{
  configured: boolean;
  subscribed: boolean;
}> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim()
  );

  const session = await getUserSession();
  if (!session) {
    return { configured, subscribed: false };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", session.user.id);

  return { configured, subscribed: (count ?? 0) > 0 };
}
