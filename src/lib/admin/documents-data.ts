import { createClient } from "@/src/lib/supabase/server";
import {
  computeDocumentStats,
  type DocumentDetail,
  type DocumentListItem,
  type DocumentRecord,
} from "@/src/lib/admin/documents-types";

function ownerDisplayName(
  owner?: { first_name: string | null; last_name: string | null } | null
) {
  if (!owner) return "Propriétaire inconnu";
  const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

function enrichDocuments(
  records: DocumentRecord[],
  vehicles: Map<
    string,
    {
      brand: string;
      model: string;
      image_url?: string | null;
      owner_id: string;
    }
  >,
  owners: Map<
    string,
    { first_name: string | null; last_name: string | null }
  >
): DocumentListItem[] {
  return records.map((record) => {
    const vehicle = vehicles.get(record.vehicle_id);

    return {
      ...record,
      vehicle_label: vehicle
        ? `${vehicle.brand} ${vehicle.model}`
        : "Véhicule inconnu",
      vehicle_image_url: vehicle?.image_url ?? null,
      owner_id: vehicle?.owner_id ?? record.owner_id ?? "",
      owner_name: ownerDisplayName(
        vehicle ? owners.get(vehicle.owner_id) : null
      ),
    };
  });
}

async function fetchLookups(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [vehiclesRes, ownersRes] = await Promise.all([
    supabase
      .from("owner_vehicle_dashboard")
      .select("vehicle_id, owner_id, brand, model, image_url"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "owner"),
  ]);

  const vehicles = new Map(
    (vehiclesRes.data ?? []).map((vehicle) => [
      vehicle.vehicle_id,
      {
        brand: vehicle.brand,
        model: vehicle.model,
        image_url: vehicle.image_url,
        owner_id: vehicle.owner_id,
      },
    ])
  );

  const owners = new Map(
    (ownersRes.data ?? []).map((owner) => [owner.id, owner])
  );

  return { vehicles, owners };
}

const DOCUMENT_SELECT =
  "id, vehicle_id, owner_id, type, name, expiration_date, is_valid, created_at";

export async function fetchDocumentsList() {
  const supabase = await createClient();

  const [documentsRes, lookups] = await Promise.all([
    supabase
      .from("documents")
      .select(DOCUMENT_SELECT)
      .order("created_at", { ascending: false }),
    fetchLookups(supabase),
  ]);

  const records = (documentsRes.data ?? []) as DocumentRecord[];
  const items = enrichDocuments(records, lookups.vehicles, lookups.owners);
  const stats = computeDocumentStats(items);

  return { items, stats };
}

export async function fetchDocumentDetail(
  documentId: string
): Promise<DocumentDetail | null> {
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("id", documentId)
    .single();

  if (error || !record) {
    return null;
  }

  const document = record as DocumentRecord;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, brand, model, image_url, owner_id")
    .eq("id", document.vehicle_id)
    .single();

  if (!vehicle) {
    return null;
  }

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone")
    .eq("id", vehicle.owner_id)
    .single();

  const base: DocumentListItem = {
    ...document,
    vehicle_label: `${vehicle.brand} ${vehicle.model}`,
    vehicle_image_url: vehicle.image_url,
    owner_id: vehicle.owner_id,
    owner_name: ownerDisplayName(owner),
  };

  return {
    ...base,
    vehicle,
    owner: owner ?? {
      id: vehicle.owner_id,
      first_name: null,
      last_name: null,
      phone: null,
    },
  };
}

export async function fetchVehiclesForDocumentForm() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("owner_vehicle_dashboard")
    .select("vehicle_id, brand, model, owner_id")
    .order("brand", { ascending: true });

  const ownersRes = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "owner");

  const owners = new Map(
    (ownersRes.data ?? []).map((owner) => [owner.id, ownerDisplayName(owner)])
  );

  return (data ?? []).map((vehicle) => ({
    id: vehicle.vehicle_id,
    label: `${vehicle.brand} ${vehicle.model} — ${owners.get(vehicle.owner_id) ?? "Propriétaire"}`,
    owner_id: vehicle.owner_id,
  }));
}

export async function fetchOwnersForDocumentFilter() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "owner")
    .order("last_name", { ascending: true });

  return (data ?? []).map((owner) => ({
    id: owner.id,
    label: ownerDisplayName(owner),
  }));
}
