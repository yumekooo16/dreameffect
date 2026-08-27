import { createAdminClient } from "@/src/lib/supabase/admin";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import {
  DEFAULT_VEHICLE_IMAGE_FRAME,
  type VehicleImageFrame,
} from "@/src/lib/vehicles/image-frame";

export type HomeVisual = {
  url: string;
  frame: VehicleImageFrame;
};

const NARRATIVE_GALLERY_LIMIT = 36;

function visualFromVehicle(vehicle: PublicVehicle): HomeVisual | null {
  const url = resolveVehicleImageUrl(vehicle.image_url);
  if (!url) return null;
  return {
    url,
    frame: vehicle.imageFrame ?? DEFAULT_VEHICLE_IMAGE_FRAME,
  };
}

function visualFromPath(
  path: string,
  frame: VehicleImageFrame
): HomeVisual | null {
  const url = resolveVehicleImageUrl(path);
  if (!url) return null;
  return { url, frame };
}

/** Mélange Fisher–Yates — O(n), sans alloc lourde. */
export function shuffleArray<T>(items: T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy;
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
 * Couvertures flotte + galeries (1 requête batch) — fluide même avec + de photos.
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
    const { data, error } = await supabase
      .from("vehicle_images")
      .select("vehicle_id, image_url")
      .in("vehicle_id", vehicleIds)
      .order("is_primary", { ascending: false })
      .limit(NARRATIVE_GALLERY_LIMIT);

    if (!error && data) {
      for (const row of data) {
        const path = typeof row.image_url === "string" ? row.image_url.trim() : "";
        if (!path) continue;
        const frame =
          frameByVehicleId.get(String(row.vehicle_id)) ??
          DEFAULT_VEHICLE_IMAGE_FRAME;
        const visual = visualFromPath(path, frame);
        if (visual) byUrl.set(visual.url, visual);
      }
    }
  } catch {
    // Pas bloquant : on garde les couvertures déjà en mémoire
  }

  return Array.from(byUrl.values());
}

/**
 * Tirage aléatoire sans doublon.
 * Préfère d'éviter l'URL du hero si d'autres photos existent.
 * Jamais la même photo 2× dans le résultat.
 */
export function pickNarrativeVisualsFromPool(
  pool: HomeVisual[],
  count = 3,
  preferExcludeUrl?: string | null
): (HomeVisual | null)[] {
  const excluded = preferExcludeUrl
    ? resolveVehicleImageUrl(preferExcludeUrl) ?? preferExcludeUrl
    : null;

  const unique = new Map<string, HomeVisual>();
  for (const visual of pool) {
    if (visual.url) unique.set(visual.url, visual);
  }

  const all = Array.from(unique.values());
  const preferred = excluded
    ? all.filter((visual) => visual.url !== excluded)
    : all;

  const source = preferred.length > 0 ? preferred : all;
  const shuffled = shuffleArray(source);
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));

  return Array.from({ length: count }, (_, index) => picked[index] ?? null);
}

/**
 * Compatible sync (couvertures seules) — préférer `loadNarrativeVisuals` sur l'accueil.
 */
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

/** Accueil : pool élargi + shuffle sans doublon. */
export async function loadNarrativeVisuals(
  vehicles: PublicVehicle[],
  count = 3,
  preferExcludeUrl?: string | null
): Promise<(HomeVisual | null)[]> {
  const pool = await collectNarrativeVisualPool(vehicles);
  return pickNarrativeVisualsFromPool(pool, count, preferExcludeUrl);
}
