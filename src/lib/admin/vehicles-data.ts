import { createClient } from "@/src/lib/supabase/server";
import type { ReservationRow } from "@/src/lib/admin/dashboard-data";
import {
  ADMIN_VEHICLE_BASE_SELECT,
  ADMIN_VEHICLE_BASE_SELECT_LEGACY,
  ADMIN_VEHICLE_FULL_SELECT,
  ADMIN_VEHICLE_FULL_SELECT_LEGACY,
  ADMIN_VEHICLE_PRICING_SELECT,
  ADMIN_VEHICLE_PRICING_SELECT_LEGACY,
  isMissingColumnError,
} from "@/src/lib/vehicles/db-columns";
import {
  computeVehicleRevenue,
  type VehicleDetail,
  type VehicleImageRow,
  type VehicleListItem,
  type VehicleRow,
} from "@/src/lib/admin/vehicles-types";

function ownerDisplayName(
  owner?: { first_name: string | null; last_name: string | null } | null
) {
  if (!owner) return "Propriétaire inconnu";
  const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

function normalizeImages(
  vehicleId: string,
  vehicleImageUrl: string | null | undefined,
  rows: VehicleImageRow[]
): VehicleImageRow[] {
  if (rows.length > 0) {
    return [...rows].sort((a, b) => {
      const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""));
    });
  }

  if (!vehicleImageUrl) return [];

  return [
    {
      id: `legacy-${vehicleId}`,
      vehicle_id: vehicleId,
      image_url: vehicleImageUrl,
      is_primary: true,
      sort_order: 0,
    },
  ];
}

export async function fetchVehiclesList(): Promise<VehicleListItem[]> {
  const supabase = await createClient();

  const [dashboardRes, vehiclesRes, ownersRes] = await Promise.all([
    supabase
      .from("owner_vehicle_dashboard")
      .select("vehicle_id, owner_id, brand, model, year, mileage, status, image_url, total_revenue"),
    supabase
      .from("vehicles")
      .select("id, created_at, owner_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "owner"),
  ]);

  const dashboard = dashboardRes.data ?? [];
  const vehicles = vehiclesRes.data ?? [];
  const owners = new Map(
    (ownersRes.data ?? []).map((owner) => [owner.id, owner])
  );

  const dashboardMap = new Map(dashboard.map((row) => [row.vehicle_id, row]));

  return vehicles.map((vehicle) => {
    const dash = dashboardMap.get(vehicle.id);
    const owner = owners.get(vehicle.owner_id);

    return {
      id: vehicle.id,
      brand: dash?.brand ?? "—",
      model: dash?.model ?? "—",
      year: dash?.year ?? null,
      mileage: dash?.mileage ?? 0,
      status: dash?.status ?? "available",
      image_url: dash?.image_url ?? null,
      created_at: vehicle.created_at,
      owner_id: vehicle.owner_id,
      owner_name: ownerDisplayName(owner),
      total_revenue: Number(dash?.total_revenue ?? 0),
    };
  });
}

async function fetchVehicleImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleId: string
): Promise<VehicleImageRow[]> {
  const withFrame = await supabase
    .from("vehicle_images")
    .select(
      "id, vehicle_id, image_url, is_primary, sort_order, created_at, image_fit, image_position_x, image_position_y, image_scale"
    )
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!withFrame.error) {
    return (withFrame.data ?? []) as VehicleImageRow[];
  }

  if (!isMissingColumnError(withFrame.error.message)) {
    return [];
  }

  const withOrder = await supabase
    .from("vehicle_images")
    .select("id, vehicle_id, image_url, is_primary, sort_order, created_at")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!withOrder.error) {
    return (withOrder.data ?? []) as VehicleImageRow[];
  }

  if (!isMissingColumnError(withOrder.error.message)) {
    return [];
  }

  const legacy = await supabase
    .from("vehicle_images")
    .select("id, vehicle_id, image_url, is_primary, created_at")
    .eq("vehicle_id", vehicleId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  return (legacy.data ?? []).map((row, index) => ({
    ...(row as VehicleImageRow),
    sort_order: index,
  }));
}

async function enrichOptionalVehicleImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicle: VehicleRow
): Promise<VehicleRow> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "public_image_url, hero_image_url, public_image_fit, public_image_position_x, public_image_position_y, public_image_scale"
    )
    .eq("id", vehicle.id)
    .maybeSingle();

  if (error?.message.includes("does not exist")) {
    const legacy = await supabase
      .from("vehicles")
      .select("public_image_url, hero_image_url")
      .eq("id", vehicle.id)
      .maybeSingle();

    if (legacy.error || !legacy.data) return vehicle;

    return {
      ...vehicle,
      public_image_url: (legacy.data.public_image_url as string | null) ?? null,
      hero_image_url: (legacy.data.hero_image_url as string | null) ?? null,
    };
  }

  if (error || !data) {
    return vehicle;
  }

  return {
    ...vehicle,
    public_image_url: (data.public_image_url as string | null) ?? null,
    hero_image_url: (data.hero_image_url as string | null) ?? null,
    public_image_fit: (data.public_image_fit as string | null) ?? null,
    public_image_position_x:
      (data.public_image_position_x as number | null) ?? null,
    public_image_position_y:
      (data.public_image_position_y as number | null) ?? null,
    public_image_scale: (data.public_image_scale as number | null) ?? null,
  };
}

async function fetchVehicleRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleId: string
): Promise<VehicleRow | null> {
  const fullResult = await supabase
    .from("vehicles")
    .select(ADMIN_VEHICLE_FULL_SELECT)
    .eq("id", vehicleId)
    .single();

  if (!fullResult.error && fullResult.data) {
    return fullResult.data as VehicleRow;
  }

  if (fullResult.error && !isMissingColumnError(fullResult.error.message)) {
    return null;
  }

  const fullLegacy = await supabase
    .from("vehicles")
    .select(ADMIN_VEHICLE_FULL_SELECT_LEGACY)
    .eq("id", vehicleId)
    .single();

  if (!fullLegacy.error && fullLegacy.data) {
    return fullLegacy.data as VehicleRow;
  }

  const baseResult = await supabase
    .from("vehicles")
    .select(ADMIN_VEHICLE_BASE_SELECT)
    .eq("id", vehicleId)
    .single();

  if (!baseResult.error && baseResult.data) {
    return enrichOptionalVehicleImages(
      supabase,
      baseResult.data as VehicleRow
    );
  }

  if (baseResult.error && !isMissingColumnError(baseResult.error.message)) {
    return null;
  }

  const baseLegacy = await supabase
    .from("vehicles")
    .select(ADMIN_VEHICLE_BASE_SELECT_LEGACY)
    .eq("id", vehicleId)
    .single();

  if (!baseLegacy.error && baseLegacy.data) {
    return enrichOptionalVehicleImages(
      supabase,
      baseLegacy.data as VehicleRow
    );
  }

  const pricingResult = await supabase
    .from("vehicles")
    .select(ADMIN_VEHICLE_PRICING_SELECT)
    .eq("id", vehicleId)
    .single();

  if (!pricingResult.error && pricingResult.data) {
    return enrichOptionalVehicleImages(supabase, {
      ...(pricingResult.data as VehicleRow),
      daily_rate: null,
      fuel: null,
      transmission: null,
      power: null,
      location: null,
      description: null,
      slug: null,
      is_published: true,
    });
  }

  const pricingLegacy = await supabase
    .from("vehicles")
    .select(ADMIN_VEHICLE_PRICING_SELECT_LEGACY)
    .eq("id", vehicleId)
    .single();

  if (pricingLegacy.error || !pricingLegacy.data) {
    return null;
  }

  return enrichOptionalVehicleImages(supabase, {
    ...(pricingLegacy.data as VehicleRow),
    daily_rate: null,
    fuel: null,
    transmission: null,
    power: null,
    location: null,
    description: null,
    slug: null,
    is_published: true,
  });
}

export async function fetchVehicleDetail(
  vehicleId: string
): Promise<VehicleDetail | null> {
  const supabase = await createClient();
  const vehicle = await fetchVehicleRow(supabase, vehicleId);

  if (!vehicle) {
    return null;
  }

  const [
    ownerRes,
    dashboardRes,
    imagesRes,
    reservationsRes,
    maintenanceRes,
    documentsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, phone")
      .eq("id", vehicle.owner_id)
      .single(),
    supabase
      .from("owner_vehicle_dashboard")
      .select("total_revenue, total_rentals")
      .eq("vehicle_id", vehicleId)
      .maybeSingle(),
    fetchVehicleImages(supabase, vehicleId),
    supabase
      .from("reservations")
      .select(
        "id, vehicle_id, start_date, end_date, customer_name, customer_email, status, owner_amount, company_amount, total_price, distance_km"
      )
      .eq("vehicle_id", vehicleId)
      .order("start_date", { ascending: false }),
    supabase
      .from("maintenance")
      .select(
        "id, vehicle_id, title, type, description, mileage, maintenance_date, next_due_date, cost, provider"
      )
      .eq("vehicle_id", vehicleId)
      .order("maintenance_date", { ascending: false }),
    supabase
      .from("documents")
      .select("id, type, name, file_url, expiration_date, is_valid")
      .eq("vehicle_id", vehicleId),
  ]);

  const reservations = (reservationsRes.data ?? []) as ReservationRow[];
  const dashboardTotal = Number(dashboardRes.data?.total_revenue ?? 0);

  return {
    vehicle: vehicle as VehicleRow,
    owner: ownerRes.data ?? {
      id: vehicle.owner_id,
      first_name: null,
      last_name: null,
      phone: null,
    },
    dashboard: {
      total_revenue: dashboardTotal,
      total_rentals: Number(dashboardRes.data?.total_rentals ?? 0),
    },
    images: normalizeImages(vehicleId, vehicle.image_url, imagesRes),
    reservations,
    maintenances: maintenanceRes.data ?? [],
    documents: documentsRes.data ?? [],
    revenue: computeVehicleRevenue(reservations, dashboardTotal),
  };
}

export async function fetchOwnersForSelect() {
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
