import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateNotificationInput,
  NotificationPriority,
} from "@/src/lib/notifications/types";

export async function createNotification(
  supabase: SupabaseClient,
  payload: CreateNotificationInput
) {
  const { error } = await supabase.from("notifications").insert({
    profile_id: payload.profile_id,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    is_read: false,
    priority: payload.priority ?? "normal",
    related_id: payload.related_id,
    created_by: payload.created_by,
  });

  if (error) {
    console.error("[createNotification]", error.message, {
      type: payload.type,
      profile_id: payload.profile_id,
    });
    throw new Error(error.message);
  }
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
  const { data: admins, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (error) {
    console.error("[notifyAllAdmins:lookup]", error.message);
    throw new Error(error.message);
  }

  if (!admins?.length) {
    console.error("[notifyAllAdmins] aucun profil admin trouvé");
    return;
  }

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
  const { data: admins, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (error) {
    console.error("[notifySystemEvent:lookup]", error.message);
    throw new Error(error.message);
  }

  if (!admins?.length) {
    console.error("[notifySystemEvent] aucun profil admin trouvé");
    return;
  }

  const actorId = payload.ownerId ?? admins[0]?.id;
  if (!actorId) return;

  if (payload.ownerId) {
    await createNotification(supabase, {
      profile_id: payload.ownerId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      related_id: payload.related_id,
      created_by: actorId,
      priority: payload.priority,
    });
  }

  for (const admin of admins) {
    // Évite le doublon si le propriétaire est aussi admin
    if (admin.id === payload.ownerId) continue;

    await createNotification(supabase, {
      profile_id: admin.id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      related_id: payload.related_id,
      created_by: actorId,
      priority: payload.priority,
    });
  }
}
