import type { SupabaseClient } from "@supabase/supabase-js";
import type { MaintenanceRecord } from "@/src/lib/admin/maintenance-types";
import { getMaintenanceTypeLabel } from "@/src/lib/maintenance/type";
import {
  createNotification,
  notifyOwnerAndAdmins,
} from "@/src/lib/notifications/service";

type VehicleInfo = {
  brand: string;
  model: string;
  owner_id: string;
};

export async function notifyMaintenanceDue(
  supabase: SupabaseClient,
  maintenance: MaintenanceRecord,
  vehicle: VehicleInfo,
  adminUserId: string
) {
  const vehicleLabel = `${vehicle.brand} ${vehicle.model}`;
  const typeLabel = getMaintenanceTypeLabel(maintenance.type);
  const dueDate = maintenance.next_due_date
    ? new Date(maintenance.next_due_date).toLocaleDateString("fr-FR")
    : "—";
  const message = `${maintenance.title} (${typeLabel}) — ${vehicleLabel} — échéance : ${dueDate}`;

  await notifyOwnerAndAdmins(supabase, {
    ownerId: vehicle.owner_id,
    adminUserId,
    type: "maintenance_due",
    title: "Entretien à prévoir",
    message,
    related_id: maintenance.id,
  });
}

export async function notifyMaintenanceCompleted(
  supabase: SupabaseClient,
  maintenance: MaintenanceRecord,
  vehicle: VehicleInfo,
  adminUserId: string
) {
  const vehicleLabel = `${vehicle.brand} ${vehicle.model}`;
  const typeLabel = getMaintenanceTypeLabel(maintenance.type);
  const message = `${maintenance.title} (${typeLabel}) — ${vehicleLabel}`;

  await createNotification(supabase, {
    profile_id: vehicle.owner_id,
    type: "maintenance_completed",
    title: "Intervention effectuée",
    message,
    related_id: maintenance.id,
    created_by: adminUserId,
  });
}
