import { createAdminClient } from "@/src/lib/supabase/admin";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import {
  homeVisualFromUrl,
  pickNarrativeVisualsFromPool,
  type HomeVisual,
} from "@/src/lib/public/narrative-visuals";
import {
  DEFAULT_VEHICLE_IMAGE_FRAME,
  frameFromImageColumns,
  type VehicleImageFrame,
} from "@/src/lib/vehicles/image-frame";
import { isMissingColumnError } from "@/src/lib/vehicles/db-columns";

export type { HomeVisual } from "@/src/lib/public/narrative-visuals";
export {
  pickNarrativeVisualsFromPool,
  shuffleArray,
} from "@/src/lib/public/narrative-visuals";

const NARRATIVE_GALLERY_LIMIT = 36;

function visualFromVehicle(vehicle: PublicVehicle): HomeVisual | null {
  if (!vehicle.image_url) return null;
  return homeVisualFromUrl(
    vehicle.image_url,
    vehicle.imageFrame ?? DEFAULT_VEHICLE_IMAGE_FRAME
  );
}

/** Image hero : variable d'environnement, puis première photo de flotte disponible. */
export function resolveHeroVisual(
  vehicles: PublicVehicle[] = []
): HomeVisual | null {
  const envHero = process.env.NEXT_PUBLIC_HERO_IMAGE?.trim();
  if (envHero) {
    const url = resolveVehicleImageUrl(envHero) ?? envHero;
    const match = vehicles.find((vehicle) => {
      const vehicleUrl = resolveVehicleImageUrl(vehicle.image_url);
      return vehicleUrl === url || vehicle.image_url === envHero;
    });

    return {
      url,
      frame: match?.imageFrame ?? DEFAULT_VEHICLE_IMAGE_FRAME,
    };
  }

  for (const vehicle of vehicles) {
    const visual = visualFromVehicle(vehicle);
    if (visual) return visual;
  }

  return null;
}

/** @deprecated Préférer resolveHeroVisual */
export function resolveHeroImageUrl(vehicles: PublicVehicle[] = []): string | null {
  return resolveHeroVisual(vehicles)?.url ?? null;
}

/**
 * Pool de visuels uniques pour le parcours accueil.
 * Couvertures flotte + galeries (1 requête batch).
 */
export async function collectNarrativeVisualPool(
  vehicles: PublicVehicle[]
): Promise<HomeVisual[]> {
  const byUrl = new Map<string, HomeVisual>();
  const frameByVehicleId = new Map<string, VehicleImageFrame>();

  for (const vehicle of vehicles) {
    frameByVehicleId.set(
      vehicle.id,
      vehicle.imageFrame ?? DEFAULT_VEHICLE_IMAGE_FRAME
    );
    const cover = visualFromVehicle(vehicle);
    if (cover) byUrl.set(cover.url, cover);
  }

  const vehicleIds = vehicles
    .map((vehicle) => vehicle.id)
    .filter((id) => !id.startsWith("demo-"));

  if (vehicleIds.length === 0) {
    return Array.from(byUrl.values());
  }

  try {
    const supabase = createAdminClient();
    const withFrame = await supabase
      .from("vehicle_images")
      .select(
        "vehicle_id, image_url, image_fit, image_position_x, image_position_y, image_scale"
      )
      .in("vehicle_id", vehicleIds)
      .order("sort_order", { ascending: true })
      .limit(NARRATIVE_GALLERY_LIMIT);

    type PoolRow = {
      vehicle_id: string;
      image_url: string | null;
      image_fit?: string | null;
      image_position_x?: number | null;
      image_position_y?: number | null;
      image_scale?: number | null;
    };

    let rows: PoolRow[] | null = null;

    if (!withFrame.error && withFrame.data) {
      rows = withFrame.data as PoolRow[];
    } else if (withFrame.error && isMissingColumnError(withFrame.error.message)) {
      const legacy = await supabase
        .from("vehicle_images")
        .select("vehicle_id, image_url")
        .in("vehicle_id", vehicleIds)
        .order("is_primary", { ascending: false })
        .limit(NARRATIVE_GALLERY_LIMIT);

      if (!legacy.error && legacy.data) {
        rows = legacy.data as PoolRow[];
      }
    }

    if (rows) {
      for (const row of rows) {
        const path = typeof row.image_url === "string" ? row.image_url.trim() : "";
        if (!path) continue;
        const hasOwnFrame =
          row.image_fit != null ||
          row.image_position_x != null ||
          row.image_position_y != null ||
          row.image_scale != null;
        const frame = hasOwnFrame
          ? frameFromImageColumns(row)
          : frameByVehicleId.get(String(row.vehicle_id)) ??
            DEFAULT_VEHICLE_IMAGE_FRAME;
        const visual = homeVisualFromUrl(path, frame);
        if (visual) byUrl.set(visual.url, visual);
      }
    }
  } catch {
    // Pas bloquant : on garde les couvertures déjà en mémoire
  }

  return Array.from(byUrl.values());
}

export function pickNarrativeVisuals(
  vehicles: PublicVehicle[],
  count = 3,
  preferExcludeUrl?: string | null
): (HomeVisual | null)[] {
  const pool = vehicles
    .map(visualFromVehicle)
    .filter((visual): visual is HomeVisual => Boolean(visual));

  return pickNarrativeVisualsFromPool(pool, count, preferExcludeUrl);
}

/** @deprecated Préférer collectNarrativeVisualPool + tirage client */
export async function loadNarrativeVisuals(
  vehicles: PublicVehicle[],
  count = 3,
  preferExcludeUrl?: string | null
): Promise<(HomeVisual | null)[]> {
  const pool = await collectNarrativeVisualPool(vehicles);
  return pickNarrativeVisualsFromPool(pool, count, preferExcludeUrl);
}
