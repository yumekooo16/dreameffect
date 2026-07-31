import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateNotificationInput,
  NotificationPriority,
} from "@/src/lib/notifications/types";

export async function createNotification(
  supabase: SupabaseClient,
  payload: CreateNotificationInput
) {
  await supabase.from("notifications").insert({
    profile_id: payload.profile_id,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    is_read: false,
    priority: payload.priority ?? "normal",
    related_id: payload.related_id,
    created_by: payload.created_by,
  });
}

export async function notifyAllAdmins(
  supabase: SupabaseClient,
  payload: {
    excludeProfileId?: string;
    type: string;
    title: string;
    message: string;
    related_id: string;
    created_by: string;
    priority?: NotificationPriority;
  }
) {
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  for (const admin of admins ?? []) {
    if (admin.id === payload.excludeProfileId) continue;

    await createNotification(supabase, {
      profile_id: admin.id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      related_id: payload.related_id,
      created_by: payload.created_by,
      priority: payload.priority,
    });
  }
}

export async function notifyOwnerAndAdmins(
  supabase: SupabaseClient,
  payload: {
    ownerId: string;
    adminUserId: string;
    type: string;
    title: string;
    message: string;
    related_id: string;
    priority?: NotificationPriority;
  }
) {
  await createNotification(supabase, {
    profile_id: payload.ownerId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    related_id: payload.related_id,
    created_by: payload.adminUserId,
    priority: payload.priority,
  });

  await notifyAllAdmins(supabase, {
    excludeProfileId: payload.adminUserId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    related_id: payload.related_id,
    created_by: payload.adminUserId,
    priority: payload.priority,
  });
}

export async function notifySystemEvent(
  supabase: SupabaseClient,
  payload: {
    ownerId?: string | null;
    type: string;
    title: string;
    message: string;
    related_id: string;
    priority?: NotificationPriority;
  }
) {
  if (payload.ownerId) {
    await createNotification(supabase, {
      profile_id: payload.ownerId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      related_id: payload.related_id,
      created_by: payload.ownerId,
      priority: payload.priority,
    });
  }

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  for (const admin of admins ?? []) {
    await createNotification(supabase, {
      profile_id: admin.id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      related_id: payload.related_id,
      created_by: admin.id,
      priority: payload.priority,
    });
  }
}
