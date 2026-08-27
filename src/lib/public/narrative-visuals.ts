import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import {
  DEFAULT_VEHICLE_IMAGE_FRAME,
  type VehicleImageFrame,
} from "@/src/lib/vehicles/image-frame";

export type HomeVisual = {
  url: string;
  frame: VehicleImageFrame;
};

/** Mélange Fisher–Yates — utilisable serveur et client. */
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

/**
 * Tirage aléatoire sans doublon.
 * Préfère d'éviter l'URL du hero s'il reste d'autres photos.
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
    if (visual?.url) unique.set(visual.url, visual);
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

export function homeVisualFromUrl(
  url: string,
  frame: VehicleImageFrame = DEFAULT_VEHICLE_IMAGE_FRAME
): HomeVisual | null {
  const resolved = resolveVehicleImageUrl(url) ?? (url.startsWith("http") ? url : null);
  if (!resolved) return null;
  return { url: resolved, frame };
}
