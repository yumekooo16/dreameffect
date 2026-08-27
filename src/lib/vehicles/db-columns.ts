/** Erreur Postgres/Supabase quand une colonne n'existe pas encore (migration non appliquée). */
export function isMissingColumnError(message: string) {
  return message.includes("does not exist");
}

export const VEHICLE_PRICING_COLUMNS =
  "price_24h_weekday, price_24h_weekend, price_48h_weekend, price_72h_weekend, price_7_days, deposit";

export const VEHICLE_PRO_PRICING_COLUMNS =
  "pro_price_24h_weekday, pro_price_24h_weekend, pro_price_48h_weekend, pro_price_72h_weekend, pro_price_7_days, pro_included_km, pro_extra_km_rate";

export const VEHICLE_CATALOG_EXTRA_COLUMNS =
  "daily_rate, fuel, transmission, power, location, description, slug, is_published";

export const PUBLIC_VEHICLE_PRICING_SELECT =
  `id, slug, brand, model, version, year, color, status, image_url, is_published, ${VEHICLE_PRICING_COLUMNS}`;

/** Catalogue public — sans colonnes optionnelles (migration pas encore appliquée). */
export const PUBLIC_VEHICLE_CATALOG_BASE =
  `id, slug, brand, model, version, year, fuel, transmission, power, location, description, color, status, image_url, daily_rate, ${VEHICLE_PRICING_COLUMNS}, is_published`;

/** Catalogue public — requête stable (sans colonnes optionnelles). */
export const PUBLIC_VEHICLE_CATALOG_SELECT = PUBLIC_VEHICLE_CATALOG_BASE;

export const ADMIN_VEHICLE_BASE_SELECT =
  `id, owner_id, brand, model, version, year, plate, vin, color, mileage, status, image_url, daily_rate, ${VEHICLE_PRICING_COLUMNS}, ${VEHICLE_PRO_PRICING_COLUMNS}, fuel, transmission, power, location, description, slug, is_published, created_at, updated_at`;

export const ADMIN_VEHICLE_BASE_SELECT_LEGACY =
  `id, owner_id, brand, model, version, year, plate, vin, color, mileage, status, image_url, daily_rate, ${VEHICLE_PRICING_COLUMNS}, fuel, transmission, power, location, description, slug, is_published, created_at, updated_at`;

export const ADMIN_VEHICLE_FULL_SELECT =
  `${ADMIN_VEHICLE_BASE_SELECT}, public_image_url, hero_image_url, public_image_fit, public_image_position_x, public_image_position_y, public_image_scale`;

export const ADMIN_VEHICLE_FULL_SELECT_LEGACY =
  `${ADMIN_VEHICLE_BASE_SELECT_LEGACY}, public_image_url, hero_image_url`;

export const ADMIN_VEHICLE_IMAGE_FRAME_SELECT =
  "public_image_fit, public_image_position_x, public_image_position_y, public_image_scale";

export const VEHICLE_PUBLIC_IMAGE_FRAME_COLUMNS =
  "public_image_fit, public_image_position_x, public_image_position_y, public_image_scale";

export const ADMIN_VEHICLE_PRICING_SELECT =
  `id, owner_id, brand, model, version, year, plate, vin, color, mileage, status, image_url, ${VEHICLE_PRICING_COLUMNS}, ${VEHICLE_PRO_PRICING_COLUMNS}, created_at, updated_at`;

export const ADMIN_VEHICLE_PRICING_SELECT_LEGACY =
  `id, owner_id, brand, model, version, year, plate, vin, color, mileage, status, image_url, ${VEHICLE_PRICING_COLUMNS}, created_at, updated_at`;

export type PublicVehicleDbRow = {
  id: string;
  slug?: string | null;
  brand: string;
  model: string;
  version?: string | null;
  year?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  power?: number | null;
  location?: string | null;
  description?: string | null;
  color?: string | null;
  status: string;
  image_url?: string | null;
  public_image_url?: string | null;
  public_image_fit?: string | null;
  public_image_position_x?: number | null;
  public_image_position_y?: number | null;
  public_image_scale?: number | null;
  daily_rate?: number | null;
  price_24h_weekday?: number | null;
  price_24h_weekend?: number | null;
  price_48h_weekend?: number | null;
  price_72h_weekend?: number | null;
  price_7_days?: number | null;
  deposit?: number | null;
  is_published?: boolean | null;
  created_at?: string;
};

export function fillPublicVehicleRow(
  row: Record<string, unknown>
): PublicVehicleDbRow {
  return {
    id: String(row.id),
    slug: (row.slug as string | null) ?? null,
    brand: String(row.brand),
    model: String(row.model),
    version: (row.version as string | null) ?? null,
    year: (row.year as number | null) ?? null,
    fuel: (row.fuel as string | null) ?? null,
    transmission: (row.transmission as string | null) ?? null,
    power: (row.power as number | null) ?? null,
    location: (row.location as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    color: (row.color as string | null) ?? null,
    status: String(row.status),
    image_url: (row.image_url as string | null) ?? null,
    public_image_url: (row.public_image_url as string | null) ?? null,
    public_image_fit: (row.public_image_fit as string | null) ?? null,
    public_image_position_x: (row.public_image_position_x as number | null) ?? null,
    public_image_position_y: (row.public_image_position_y as number | null) ?? null,
    public_image_scale: (row.public_image_scale as number | null) ?? null,
    daily_rate: (row.daily_rate as number | null) ?? null,
    price_24h_weekday: (row.price_24h_weekday as number | null) ?? null,
    price_24h_weekend: (row.price_24h_weekend as number | null) ?? null,
    price_48h_weekend: (row.price_48h_weekend as number | null) ?? null,
    price_72h_weekend: (row.price_72h_weekend as number | null) ?? null,
    price_7_days: (row.price_7_days as number | null) ?? null,
    deposit: (row.deposit as number | null) ?? null,
    is_published: (row.is_published as boolean | null) ?? true,
    created_at: row.created_at as string | undefined,
  };
}
