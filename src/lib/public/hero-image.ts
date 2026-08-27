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

function visualFromVehicle(vehicle: PublicVehicle): HomeVisual | null {
  const url = resolveVehicleImageUrl(vehicle.image_url);
  if (!url) return null;
  return {
    url,
    frame: vehicle.imageFrame ?? DEFAULT_VEHICLE_IMAGE_FRAME,
  };
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
 * Jusqu'à `count` visuels pour les sections numérotées.
 * Préfère des photos distinctes (différentes du hero si possible),
 * puis réutilise la flotte pour ne jamais laisser un step vide.
 */
export function pickNarrativeVisuals(
  vehicles: PublicVehicle[],
  count = 3,
  preferExcludeUrl?: string | null
): (HomeVisual | null)[] {
  const excluded = preferExcludeUrl
    ? resolveVehicleImageUrl(preferExcludeUrl)
    : null;

  const all: HomeVisual[] = [];
  const preferredByBrand = new Map<string, HomeVisual[]>();

  for (const vehicle of vehicles) {
    const visual = visualFromVehicle(vehicle);
    if (!visual) continue;

    if (!all.some((item) => item.url === visual.url)) {
      all.push(visual);
    }

    if (visual.url === excluded) continue;

    const brand = vehicle.brand.trim().toLowerCase() || "autre";
    const list = preferredByBrand.get(brand) ?? [];
    if (!list.some((item) => item.url === visual.url)) {
      list.push(visual);
      preferredByBrand.set(brand, list);
    }
  }

  const picked = pickAlternatingByBrand(preferredByBrand, count);

  // Compléter avec toute la flotte (y compris le hero) si pas assez de photos
  if (picked.length < count && all.length > 0) {
    let i = 0;
    while (picked.length < count && i < count * Math.max(all.length, 1) + 4) {
      const candidate = all[i % all.length];
      if (!candidate) break;

      const alreadyUsed = picked.some((item) => item.url === candidate.url);
      if (!alreadyUsed || picked.length + (count - picked.length) > all.length) {
        // Ajoute si nouveau, ou autorise la répétition en dernier recours
        if (!alreadyUsed || i >= all.length) {
          picked.push(candidate);
        }
      }
      i += 1;
    }
  }

  // Dernier filet : répéter la première photo dispo plutôt qu'un cadre vide
  while (picked.length < count && all[0]) {
    picked.push(all[0]);
  }

  return Array.from({ length: count }, (_, index) => picked[index] ?? null);
}

function pickAlternatingByBrand(
  byBrand: Map<string, HomeVisual[]>,
  count: number
): HomeVisual[] {
  const brands = Array.from(byBrand.keys());
  const visuals: HomeVisual[] = [];
  let guard = 0;

  while (
    visuals.length < count &&
    brands.length > 0 &&
    guard < count * brands.length + 8
  ) {
    const brand = brands[guard % brands.length];
    const list = byBrand.get(brand);
    const next = list?.shift();
    if (next && !visuals.some((item) => item.url === next.url)) {
      visuals.push(next);
    }
    guard += 1;
  }

  return visuals;
}
