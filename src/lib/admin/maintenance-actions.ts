"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { requireAdmin } from "@/src/lib/admin/auth";
import type { MaintenanceFormData } from "@/src/lib/admin/maintenance-types";
import type { MaintenanceRecord } from "@/src/lib/admin/maintenance-types";
import {
  notifyMaintenanceCompleted,
  notifyMaintenanceDue,
} from "@/src/lib/admin/maintenance-notifications";
import { getMaintenanceDueStatus } from "@/src/lib/maintenance/type";

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

function revalidateMaintenancePaths(id?: string, vehicleId?: string) {
  revalidatePath("/admin/maintenance");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/maintenance/${id}`);
  if (vehicleId) revalidatePath(`/admin/vehicules/${vehicleId}`);
  revalidatePath("/admin/vehicules");
  revalidatePath("/admin/proprietaires");
}

async function getVehicleInfo(vehicleId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("brand, model, owner_id")
    .eq("id", vehicleId)
    .single();

  return data;
}

function buildPayload(data: MaintenanceFormData, createdBy?: string) {
  return {
    vehicle_id: data.vehicle_id,
    type: data.type,
    title: data.title.trim(),
    description: data.description.trim() || null,
    mileage: data.mileage,
    maintenance_date: data.maintenance_date,
    next_due_date: data.next_due_date || null,
    cost: data.cost,
    provider: data.provider.trim() || null,
    updated_at: new Date().toISOString(),
    ...(createdBy ? { created_by: createdBy } : {}),
  };
}

function validateForm(data: MaintenanceFormData): string | null {
  if (!data.vehicle_id) return "Véhicule requis";
  if (!data.type) return "Type d'entretien requis";
  if (!data.title.trim()) return "Titre requis";
  if (!data.maintenance_date) return "Date d'intervention requise";
  if (data.mileage < 0) return "Kilométrage invalide";
  if (data.cost < 0) return "Coût invalide";
  return null;
}

export async function createMaintenance(
  data: MaintenanceFormData
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const validationError = validateForm(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const { data: maintenance, error } = await supabase
    .from("maintenance")
    .insert(buildPayload(data, user.id))
    .select(
      "id, vehicle_id, title, type, description, mileage, maintenance_date, next_due_date, cost, provider"
    )
    .single();

  if (error || !maintenance) {
    return { success: false, error: error?.message ?? "Création impossible" };
  }

  const vehicle = await getVehicleInfo(maintenance.vehicle_id);

  if (vehicle) {
    const dueStatus = getMaintenanceDueStatus(maintenance.next_due_date);
    if (dueStatus === "due_soon" || dueStatus === "overdue") {
      await notifyMaintenanceDue(
        supabase,
        maintenance as MaintenanceRecord,
        vehicle,
        user.id
      );
    }
  }

  revalidateMaintenancePaths(maintenance.id, maintenance.vehicle_id);
  return { success: true, id: maintenance.id };
}

export async function updateMaintenance(
  maintenanceId: string,
  data: MaintenanceFormData
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const validationError = validateForm(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const { data: existing } = await supabase
    .from("maintenance")
    .select("vehicle_id, next_due_date")
    .eq("id", maintenanceId)
    .single();

  const { data: maintenance, error } = await supabase
    .from("maintenance")
    .update(buildPayload(data))
    .eq("id", maintenanceId)
    .select(
      "id, vehicle_id, title, type, description, mileage, maintenance_date, next_due_date, cost, provider"
    )
    .single();

  if (error || !maintenance) {
    return { success: false, error: error?.message ?? "Mise à jour impossible" };
  }

  const vehicle = await getVehicleInfo(maintenance.vehicle_id);

  if (vehicle) {
    const newDueStatus = getMaintenanceDueStatus(maintenance.next_due_date);
    const oldDueStatus = getMaintenanceDueStatus(existing?.next_due_date);

    if (
      (newDueStatus === "due_soon" || newDueStatus === "overdue") &&
      newDueStatus !== oldDueStatus
    ) {
      await notifyMaintenanceDue(
        supabase,
        maintenance as MaintenanceRecord,
        vehicle,
        user.id
      );
    }
  }

  revalidateMaintenancePaths(maintenanceId, maintenance.vehicle_id);
  if (existing?.vehicle_id && existing.vehicle_id !== maintenance.vehicle_id) {
    revalidateMaintenancePaths(undefined, existing.vehicle_id);
  }

  return { success: true, id: maintenanceId };
}

export async function notifyOwnerOfMaintenance(
  maintenanceId: string
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: maintenance, error } = await supabase
    .from("maintenance")
    .select(
      "id, vehicle_id, title, type, description, mileage, maintenance_date, next_due_date, cost, provider"
    )
    .eq("id", maintenanceId)
    .single();

  if (error || !maintenance) {
    return { success: false, error: "Intervention introuvable" };
  }

  const vehicle = await getVehicleInfo(maintenance.vehicle_id);

  if (!vehicle) {
    return { success: false, error: "Véhicule introuvable" };
  }

  await notifyMaintenanceCompleted(
    supabase,
    maintenance as MaintenanceRecord,
    vehicle,
    user.id
  );

  return { success: true, id: maintenanceId };
}
