import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import {
  CONTRACT_FIELD_DEFS,
  type ContractFieldName,
  type ExtractedFieldRecord,
  type FieldConfidence,
} from "@/src/lib/contracts/fields";
import { RESERVATION_CONTRACTS_BUCKET } from "@/src/lib/reservations/client-docs";
import type { ReservationContractRow } from "@/src/lib/admin/contract-types";

export type { ReservationContractRow } from "@/src/lib/admin/contract-types";

function emptyFields(reservationId: string): ExtractedFieldRecord[] {
  return CONTRACT_FIELD_DEFS.map((def) => ({
    reservation_id: reservationId,
    field_name: def.name,
    value: null,
    confidence: "unknown" as FieldConfidence,
    source_document: null,
    status: "pending" as const,
    needs_review: true,
    inconsistency_note: null,
  }));
}

export async function fetchExtractedFields(
  reservationId: string
): Promise<ExtractedFieldRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservation_extracted_fields")
    .select(
      "id, reservation_id, field_name, value, confidence, source_document, status, needs_review, inconsistency_note"
    )
    .eq("reservation_id", reservationId);

  if (error) {
    console.error("[fetchExtractedFields]", error.message);
    return emptyFields(reservationId);
  }

  const byName = new Map(
    (data ?? []).map((row) => [row.field_name, row as ExtractedFieldRecord])
  );

  return CONTRACT_FIELD_DEFS.map((def) => {
    const existing = byName.get(def.name);
    return existing ?? emptyFields(reservationId).find((f) => f.field_name === def.name)!;
  });
}

export async function fetchLatestReservationContract(
  reservationId: string
): Promise<ReservationContractRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservation_contracts")
    .select(
      "id, reservation_id, status, template_version, storage_path, file_name, generated_at, created_at"
    )
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[fetchLatestReservationContract]", error.message);
    return null;
  }
  if (!data) return null;

  let signedUrl: string | null = null;
  if (data.storage_path) {
    try {
      const admin = createAdminClient();
      const { data: signed } = await admin.storage
        .from(RESERVATION_CONTRACTS_BUCKET)
        .createSignedUrl(data.storage_path, 60 * 30);
      signedUrl = signed?.signedUrl ?? null;
    } catch (err) {
      console.error("[fetchLatestReservationContract:signed]", err);
    }
  }

  return { ...data, signed_url: signedUrl };
}

export function fieldsToMap(fields: ExtractedFieldRecord[]) {
  const map: Partial<Record<ContractFieldName, string | null>> = {};
  for (const field of fields) {
    map[field.field_name as ContractFieldName] = field.value;
  }
  return map;
}
