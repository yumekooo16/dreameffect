"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { requireAdmin } from "@/src/lib/admin/auth";
import type { OwnerPayoutFormData } from "@/src/lib/admin/finance-types";

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

function revalidateFinancePaths() {
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

function buildPayoutPayload(data: OwnerPayoutFormData) {
  return {
    owner_id: data.owner_id,
    amount_due: data.amount_due,
    amount_paid: data.amount_paid,
    period_start: data.period_start,
    period_end: data.period_end,
    status: data.status,
    notes: data.notes.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export async function createOwnerPayout(
  data: OwnerPayoutFormData
): Promise<ActionResult> {
  await requireAdmin();

  if (!data.owner_id) {
    return { success: false, error: "Propriétaire requis" };
  }

  if (!data.period_start || !data.period_end) {
    return { success: false, error: "Période requise" };
  }

  const supabase = await createClient();

  const { data: payout, error } = await supabase
    .from("owner_payouts")
    .insert(buildPayoutPayload(data))
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: "Impossible de créer le reversement. Vérifiez que la table owner_payouts existe.",
    };
  }

  revalidateFinancePaths();
  return { success: true, id: payout.id };
}

export async function updateOwnerPayout(
  id: string,
  data: OwnerPayoutFormData
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("owner_payouts")
    .update(buildPayoutPayload(data))
    .eq("id", id);

  if (error) {
    return { success: false, error: "Impossible de mettre à jour le reversement" };
  }

  revalidateFinancePaths();
  return { success: true, id };
}

export async function markPayoutAsPaid(id: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: payout, error: fetchError } = await supabase
    .from("owner_payouts")
    .select("amount_due")
    .eq("id", id)
    .single();

  if (fetchError || !payout) {
    return { success: false, error: "Reversement introuvable" };
  }

  const { error } = await supabase
    .from("owner_payouts")
    .update({
      status: "paid",
      amount_paid: Number(payout.amount_due),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Impossible de marquer comme payé" };
  }

  revalidateFinancePaths();
  return { success: true, id };
}

export async function deleteOwnerPayout(id: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase.from("owner_payouts").delete().eq("id", id);

  if (error) {
    return { success: false, error: "Impossible de supprimer le reversement" };
  }

  revalidateFinancePaths();
  return { success: true, id };
}
