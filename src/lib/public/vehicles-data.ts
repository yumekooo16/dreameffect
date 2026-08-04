import { createPublicClient } from "@/src/lib/supabase/public";
import { buildVehicleSlug } from "@/src/lib/public/vehicle-slug";
import {
  deriveDailyRate,
  normalizeVehiclePricing,
  type VehiclePricing,
} from "@/src/lib/vehicles/pricing";
import {
  fillPublicVehicleRow,
  isMissingColumnError,
  PUBLIC_VEHICLE_CATALOG_SELECT,
  PUBLIC_VEHICLE_PRICING_SELECT,
  type PublicVehicleDbRow,
} from "@/src/lib/vehicles/db-columns";
import { toPublicVehicleStatus } from "@/src/lib/public/vehicle-status";
import type {
  PublicVehicle,
  PublicVehicleDetail,
  PublicVehicleImage,
} from "@/src/lib/public/vehicles-types";

const FALLBACK_SELECT =
  "id, slug, brand, model, version, year, color, status, image_url, is_published, created_at";

type PublicVehicleRow = PublicVehicleDbRow;

async function enrichPublicImageUrls(
  rows: PublicVehicleRow[]
): Promise<PublicVehicleRow[]> {
  if (rows.length === 0) return rows;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, public_image_url")
    .in(
      "id",
      rows.map((row) => row.id)
    );

  if (error?.message.includes("does not exist") || error || !data) {
    return rows;
  }

  const byId = new Map(
    data.map((row) => [String(row.id), (row.public_image_url as string | null) ?? null])
  );

  return rows.map((row) => ({
    ...row,
    public_image_url: byId.get(row.id) ?? null,
  }));
}

async function fetchPublishedVehicleRow(
  filters: { slug?: string; id?: string }
): Promise<PublicVehicleRow | null> {
  const supabase = createPublicClient();

  if (filters.slug) {
    const bySlug = await supabase
      .from("vehicles")
      .select(PUBLIC_VEHICLE_CATALOG_SELECT)
      .eq("is_published", true)
      .eq("slug", filters.slug)
      .maybeSingle();

    if (!bySlug.error && bySlug.data) {
      const [row] = await enrichPublicImageUrls([
        fillPublicVehicleRow(bySlug.data),
      ]);
      return row ?? null;
    }

    if (bySlug.error && !isMissingColumnError(bySlug.error.message)) {
      console.error("[fetchPublishedVehicleRow]", bySlug.error.message);
      return null;
    }
  }

  if (filters.id) {
    const byId = await supabase
      .from("vehicles")
      .select(PUBLIC_VEHICLE_CATALOG_SELECT)
      .eq("is_published", true)
      .eq("id", filters.id)
      .maybeSingle();

    if (!byId.error && byId.data) {
      const [row] = await enrichPublicImageUrls([fillPublicVehicleRow(byId.data)]);
      return row ?? null;
    }

    if (byId.error && !isMissingColumnError(byId.error.message)) {
      console.error("[fetchPublishedVehicleRow]", byId.error.message);
      return null;
    }
  }

  return null;
}

async function fetchPublishedRows(): Promise<PublicVehicleRow[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_CATALOG_SELECT)
    .eq("is_published", true)
    .order("brand", { ascending: true })
    .order("model", { ascending: true });

  if (!error) {
    return enrichPublicImageUrls((data ?? []).map((row) => fillPublicVehicleRow(row)));
  }

  if (!isMissingColumnError(error.message)) {
    console.error("[fetchPublicVehicles]", error.message);
    return [];
  }

  const pricing = await supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_PRICING_SELECT)
    .eq("is_published", true)
    .order("brand", { ascending: true })
    .order("model", { ascending: true });

  if (!pricing.error) {
    return enrichPublicImageUrls(
      (pricing.data ?? []).map((row) => fillPublicVehicleRow(row))
    );
  }

  if (!isMissingColumnError(pricing.error.message)) {
    console.error("[fetchPublicVehicles:pricing]", pricing.error.message);
    return [];
  }

  const fallback = await supabase
    .from("vehicles")
    .select(FALLBACK_SELECT)
    .eq("is_published", true)
    .order("brand", { ascending: true })
    .order("model", { ascending: true });

  if (fallback.error) {
    console.error("[fetchPublicVehicles:fallback]", fallback.error.message);
    return [];
  }

  return enrichPublicImageUrls(
    (fallback.data ?? []).map((row) => fillPublicVehicleRow(row))
  );
}

function resolveSlug(row: Pick<PublicVehicleRow, "id" | "slug" | "brand" | "model" | "version">) {
  if (row.slug?.trim()) return row.slug.trim();
  return `${buildVehicleSlug(row.brand, row.model, row.version)}-${row.id.slice(0, 8)}`;
}

function mapPricing(row: PublicVehicleRow): VehiclePricing {
  return normalizeVehiclePricing({
    price_24h_weekday: row.price_24h_weekday,
    price_24h_weekend: row.price_24h_weekend,
    price_48h_weekend: row.price_48h_weekend,
    price_72h_weekend: row.price_72h_weekend,
    price_7_days: row.price_7_days,
    deposit: row.deposit,
  });
}

function resolvePublicCoverImage(row: Pick<PublicVehicleRow, "public_image_url" | "image_url">) {
  return row.public_image_url?.trim() || row.image_url?.trim() || null;
}

function mapPublicVehicle(row: PublicVehicleRow): PublicVehicle {
  const pricing = mapPricing(row);

  return {
    id: row.id,
    slug: resolveSlug(row),
    brand: row.brand,
    model: row.model,
    version: row.version,
    year: row.year,
    fuel: row.fuel,
    transmission: row.transmission,
    power: row.power,
    location: row.location,
    description: row.description,
    image_url: resolvePublicCoverImage(row),
    daily_rate:
      row.daily_rate != null
        ? Number(row.daily_rate)
        : deriveDailyRate(pricing),
    pricing,
    status: toPublicVehicleStatus(row.status),
  };
}

function normalizeImages(
  vehicleId: string,
  imageUrl: string | null,
  publicImageUrl: string | null,
  rows: PublicVehicleImage[]
): PublicVehicleImage[] {
  const coverUrl = publicImageUrl?.trim() || imageUrl?.trim() || null;
  let images =
    rows.length > 0
      ? rows.map((row) => ({ ...row }))
      : coverUrl
        ? [
            {
              id: `legacy-${vehicleId}`,
              image_url: coverUrl,
              is_primary: true,
            },
          ]
        : [];

  if (!coverUrl || images.length === 0) {
    return images;
  }

  const existingIndex = images.findIndex((image) => image.image_url === coverUrl);

  if (existingIndex === -1) {
    return [
      {
        id: `public-${vehicleId}`,
        image_url: coverUrl,
        is_primary: true,
      },
      ...images.map((image) => ({ ...image, is_primary: false })),
    ];
  }

  const [cover] = images.splice(existingIndex, 1);
  return [
    { ...cover, is_primary: true },
    ...images.map((image) => ({ ...image, is_primary: false })),
  ];
}

export async function fetchPublicVehicles(): Promise<PublicVehicle[]> {
  const rows = await fetchPublishedRows();
  return rows.map(mapPublicVehicle);
}

export async function fetchPublicVehicleBySlug(
  slug: string
): Promise<PublicVehicleDetail | null> {
  const supabase = createPublicClient();

  let row = await fetchPublishedVehicleRow({ slug });

  if (!row) {
    const rows = await fetchPublishedRows();
    row = rows.find((vehicle) => resolveSlug(vehicle) === slug) ?? null;

    if (!row) {
      const legacyMatch = slug.match(/^(.+)-([a-f0-9]{8})$/i);
      if (legacyMatch) {
        const idPrefix = legacyMatch[2].toLowerCase();
        row =
          rows.find((vehicle) => vehicle.id.toLowerCase().startsWith(idPrefix)) ??
          null;
      }
    }
  }

  if (!row) return null;

  const { data: images } = await supabase
    .from("vehicle_images")
    .select("id, image_url, is_primary")
    .eq("vehicle_id", row.id)
    .order("created_at", { ascending: true });

  const base = mapPublicVehicle(row);

  return {
    ...base,
    color: row.color,
    images: normalizeImages(
      row.id,
      row.image_url ?? null,
      row.public_image_url ?? null,
      (images ?? []) as PublicVehicleImage[]
    ),
  };
}

export async function fetchPublicVehicleSlugs(): Promise<string[]> {
  const vehicles = await fetchPublicVehicles();
  return vehicles.map((vehicle) => vehicle.slug);
}

export function getVehicleDisplayName(vehicle: Pick<PublicVehicle, "brand" | "model" | "version">) {
  return [vehicle.brand, vehicle.model, vehicle.version?.trim()]
    .filter(Boolean)
    .join(" ");
}
