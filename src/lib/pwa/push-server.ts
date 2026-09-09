import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PushPayload } from "@/src/lib/pwa/push";
import { SITE_URL } from "@/src/lib/public/site";

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "mailto:contact@dreameffect.fr";

  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function isPushServerConfigured() {
  return Boolean(getVapidConfig());
}

function ensureWebPush() {
  const config = getVapidConfig();
  if (!config) return null;
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return config;
}

export async function sendPushToProfile(
  supabase: SupabaseClient,
  profileId: string,
  payload: PushPayload
) {
  if (!ensureWebPush()) return { sent: 0, skipped: true as const };

  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("profile_id", profileId);

  if (error) {
    console.error("[sendPushToProfile:lookup]", error.message);
    return { sent: 0, skipped: false as const };
  }

  if (!rows?.length) return { sent: 0, skipped: false as const };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/icon-192x192.png",
    url: payload.url || `${SITE_URL}/admin`,
  });

  let sent = 0;

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        body
      );
      sent += 1;
    } catch (err) {
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? Number((err as { statusCode?: number }).statusCode)
          : null;

      console.error("[sendPushToProfile:send]", statusCode, err);

      // Abonnement expiré / invalide
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", row.id);
      }
    }
  }

  return { sent, skipped: false as const };
}

export async function sendPushToAdmins(
  supabase: SupabaseClient,
  payload: PushPayload
) {
  const { data: admins, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (error) {
    console.error("[sendPushToAdmins]", error.message);
    return;
  }

  for (const admin of admins ?? []) {
    await sendPushToProfile(supabase, admin.id, payload);
  }
}
