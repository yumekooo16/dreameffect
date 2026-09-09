import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import {
  RESERVATION_DOCS_BUCKET,
  getReservationDocTypeLabel,
  type ReservationDocType,
  type ReservationDocsStatus,
} from "@/src/lib/reservations/client-docs";
import { hashUploadToken } from "@/src/lib/reservations/upload-token";

export type ReservationClientDocument = {
  id: string;
  reservation_id: string;
  type: ReservationDocType | string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  type_label: string;
  signed_url: string | null;
};

export type ActiveUploadToken = {
  id: string;
  reservation_id: string;
  expires_at: string;
  created_at: string;
  last_used_at: string | null;
};

export type DossierContext = {
  reservationId: string;
  customerName: string | null;
  vehicleLabel: string;
  startDate: string;
  endDate: string;
  docsStatus: ReservationDocsStatus | string;
  uploadedTypes: ReservationDocType[];
  expiresAt: string;
};

export async function fetchReservationClientDocuments(
  reservationId: string
): Promise<ReservationClientDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservation_documents")
    .select(
      "id, reservation_id, type, storage_path, original_filename, mime_type, file_size, uploaded_at"
    )
    .eq("reservation_id", reservationId)
    .order("uploaded_at", { ascending: true });

  if (error) {
    console.error("[fetchReservationClientDocuments]", error.message);
    return [];
  }

  const admin = createAdminClient();
  const rows = data ?? [];

  return Promise.all(
    rows.map(async (row) => {
      const { data: signed } = await admin.storage
        .from(RESERVATION_DOCS_BUCKET)
        .createSignedUrl(row.storage_path, 60 * 30);

      return {
        ...row,
        type_label: getReservationDocTypeLabel(row.type),
        signed_url: signed?.signedUrl ?? null,
      };
    })
  );
}

export async function fetchActiveUploadToken(
  reservationId: string
): Promise<ActiveUploadToken | null> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("reservation_upload_tokens")
    .select("id, reservation_id, expires_at, created_at, last_used_at")
    .eq("reservation_id", reservationId)
    .is("revoked_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[fetchActiveUploadToken]", error.message);
    return null;
  }

  return data;
}

export async function fetchDossierContextByToken(
  rawToken: string
): Promise<DossierContext | null> {
  const token = rawToken.trim();
  if (!token) return null;

  const admin = createAdminClient();
  const tokenHash = hashUploadToken(token);
  const nowIso = new Date().toISOString();

  const { data: tokenRow, error: tokenError } = await admin
    .from("reservation_upload_tokens")
    .select("id, reservation_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError || !tokenRow) {
    if (tokenError) {
      console.error("[fetchDossierContextByToken:token]", tokenError.message);
    }
    return null;
  }

  if (tokenRow.revoked_at || tokenRow.expires_at <= nowIso) {
    return null;
  }

  const { data: reservation, error: reservationError } = await admin
    .from("reservations")
    .select(
      "id, customer_name, start_date, end_date, docs_status, vehicle_id, vehicles(brand, model)"
    )
    .eq("id", tokenRow.reservation_id)
    .maybeSingle();

  if (reservationError || !reservation) {
    if (reservationError) {
      console.error(
        "[fetchDossierContextByToken:reservation]",
        reservationError.message
      );
    }
    return null;
  }

  const vehicleRaw = reservation.vehicles as
    | { brand: string; model: string }
    | { brand: string; model: string }[]
    | null;
  const vehicle = Array.isArray(vehicleRaw) ? vehicleRaw[0] : vehicleRaw;
  const vehicleLabel = vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : "Véhicule";

  const { data: docs } = await admin
    .from("reservation_documents")
    .select("type")
    .eq("reservation_id", reservation.id);

  return {
    reservationId: reservation.id,
    customerName: reservation.customer_name,
    vehicleLabel,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    docsStatus: reservation.docs_status ?? "missing",
    uploadedTypes: (docs ?? []).map((doc) => doc.type as ReservationDocType),
    expiresAt: tokenRow.expires_at,
  };
}
