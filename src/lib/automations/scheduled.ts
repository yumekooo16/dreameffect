import type { SupabaseClient } from "@supabase/supabase-js";

export async function wasAutomationSentToday(
  supabase: SupabaseClient,
  automationKey: string,
  entityType: string,
  entityId: string
) {
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("automation_sent")
    .select("id")
    .eq("automation_key", automationKey)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("sent_on", today)
    .maybeSingle();

  return Boolean(data);
}

export async function markAutomationSent(
  supabase: SupabaseClient,
  automationKey: string,
  entityType: string,
  entityId: string
) {
  const today = new Date().toISOString().slice(0, 10);

  await supabase.from("automation_sent").upsert(
    {
      automation_key: automationKey,
      entity_type: entityType,
      entity_id: entityId,
      sent_on: today,
    },
    { onConflict: "automation_key,entity_type,entity_id,sent_on" }
  );
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type AutomationRunResult = {
  documents: number;
  maintenance: number;
  rentalStarts: number;
  rentalEnds: number;
};

export async function runScheduledAutomations(
  supabase: SupabaseClient
): Promise<AutomationRunResult> {
  const result: AutomationRunResult = {
    documents: 0,
    maintenance: 0,
    rentalStarts: 0,
    rentalEnds: 0,
  };

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const [documentsRes, maintenanceRes, reservationsRes, vehiclesRes] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id, vehicle_id, name, type, expiration_date, is_valid"),
      supabase
        .from("maintenance")
        .select("id, vehicle_id, title, next_due_date"),
      supabase
        .from("reservations")
        .select(
          "id, vehicle_id, start_date, end_date, customer_name, status"
        )
        .in("status", ["pending", "confirmed"]),
      supabase.from("vehicles").select("id, brand, model, owner_id"),
    ]);

  const vehicles = new Map(
    (vehiclesRes.data ?? []).map((vehicle) => [vehicle.id, vehicle])
  );

  for (const document of documentsRes.data ?? []) {
    if (!document.expiration_date || document.is_valid === false) continue;

    const expiration = startOfDay(new Date(document.expiration_date));
    const daysUntil = Math.ceil(
      (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (![30, 7, 1, 0].includes(daysUntil) && daysUntil >= 0) continue;
    if (daysUntil < 0 && daysUntil !== -1) continue;

    const key =
      daysUntil < 0 ? "document_expired" : `document_expiring_${daysUntil}d`;
    if (
      await wasAutomationSentToday(supabase, key, "document", document.id)
    ) {
      continue;
    }

    const vehicle = vehicles.get(document.vehicle_id);
    if (!vehicle) continue;

    const vehicleLabel = `${vehicle.brand} ${vehicle.model}`;
    const message = `${document.name} (${vehicleLabel}) — échéance ${expiration.toLocaleDateString("fr-FR")}`;

    const { notifySystemEvent } = await import("@/src/lib/notifications/service");
    await notifySystemEvent(supabase, {
      ownerId: vehicle.owner_id,
      type: "document_expiring",
      title:
        daysUntil < 0 ? "Document expiré" : "Rappel document à renouveler",
      message,
      related_id: document.id,
      priority: daysUntil <= 7 ? "high" : "medium",
    });

    await markAutomationSent(supabase, key, "document", document.id);
    result.documents += 1;
  }

  for (const item of maintenanceRes.data ?? []) {
    if (!item.next_due_date) continue;

    const due = startOfDay(new Date(item.next_due_date));
    const daysUntil = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil > 7 || daysUntil < -7) continue;

    const key = daysUntil < 0 ? "maintenance_overdue" : "maintenance_due_7d";
    if (await wasAutomationSentToday(supabase, key, "maintenance", item.id)) {
      continue;
    }

    const vehicle = vehicles.get(item.vehicle_id);
    if (!vehicle) continue;

    const vehicleLabel = `${vehicle.brand} ${vehicle.model}`;
    const message = `${item.title} — ${vehicleLabel} (${due.toLocaleDateString("fr-FR")})`;

    const { notifySystemEvent } = await import("@/src/lib/notifications/service");
    await notifySystemEvent(supabase, {
      ownerId: vehicle.owner_id,
      type: "maintenance_due",
      title: daysUntil < 0 ? "Entretien en retard" : "Rappel entretien",
      message,
      related_id: item.id,
      priority: daysUntil <= 0 ? "high" : "medium",
    });

    await markAutomationSent(supabase, key, "maintenance", item.id);
    result.maintenance += 1;
  }

  for (const reservation of reservationsRes.data ?? []) {
    const start = startOfDay(new Date(reservation.start_date));
    const end = startOfDay(new Date(reservation.end_date));
    const vehicle = vehicles.get(reservation.vehicle_id);
    if (!vehicle) continue;

    const vehicleLabel = `${vehicle.brand} ${vehicle.model}`;
    const customer = reservation.customer_name ?? "Client";

    if (isSameDay(start, tomorrow)) {
      const key = "rental_start_tomorrow";
      if (
        !(await wasAutomationSentToday(
          supabase,
          key,
          "reservation",
          reservation.id
        ))
      ) {
        const { notifySystemEvent } = await import(
          "@/src/lib/notifications/service"
        );
        await notifySystemEvent(supabase, {
          ownerId: vehicle.owner_id,
          type: "rental_reminder_start",
          title: "Location demain",
          message: `${vehicleLabel} — ${customer} (départ demain)`,
          related_id: reservation.id,
          priority: "medium",
        });
        await markAutomationSent(
          supabase,
          key,
          "reservation",
          reservation.id
        );
        result.rentalStarts += 1;
      }
    }

    if (isSameDay(end, tomorrow)) {
      const key = "rental_end_tomorrow";
      if (
        !(await wasAutomationSentToday(
          supabase,
          key,
          "reservation",
          reservation.id
        ))
      ) {
        const { notifySystemEvent } = await import(
          "@/src/lib/notifications/service"
        );
        await notifySystemEvent(supabase, {
          ownerId: vehicle.owner_id,
          type: "rental_reminder_end",
          title: "Retour demain",
          message: `${vehicleLabel} — ${customer} (retour demain)`,
          related_id: reservation.id,
          priority: "medium",
        });
        await markAutomationSent(
          supabase,
          key,
          "reservation",
          reservation.id
        );
        result.rentalEnds += 1;
      }
    }
  }

  return result;
}
