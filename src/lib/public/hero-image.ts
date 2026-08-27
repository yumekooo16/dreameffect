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

/** Image hero : variable d'environnement, puis première photo de flotte disponible. */
export function resolveHeroVisual(
  vehicles: PublicVehicle[] = []
): HomeVisual | null {
  const envHero = process.env.NEXT_PUBLIC_HERO_IMAGE?.trim();
  if (envHero) {
    const url = resolveVehicleImageUrl(envHero) ?? envHero;
    // Si l'URL matche un véhicule, réutiliser son cadrage admin
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
    const url = resolveVehicleImageUrl(vehicle.image_url);
    if (url) {
      return {
        url,
        frame: vehicle.imageFrame ?? DEFAULT_VEHICLE_IMAGE_FRAME,
      };
    }
  }

  return null;
}

/** @deprecated Préférer resolveHeroVisual */
export function resolveHeroImageUrl(vehicles: PublicVehicle[] = []): string | null {
  return resolveHeroVisual(vehicles)?.url ?? null;
}

/**
 * Jusqu'à `count` visuels distincts pour les sections numérotées.
 * Alterne les marques pour éviter de répéter la même photo BMW.
 */
export function pickNarrativeVisuals(
  vehicles: PublicVehicle[],
  count = 3,
  excludeUrl?: string | null
): (HomeVisual | null)[] {
  const excluded = excludeUrl ? resolveVehicleImageUrl(excludeUrl) : null;
  const byBrand = new Map<string, HomeVisual[]>();

  for (const vehicle of vehicles) {
    const url = resolveVehicleImageUrl(vehicle.image_url);
    if (!url || url === excluded) continue;

    const brand = vehicle.brand.trim().toLowerCase() || "autre";
    const list = byBrand.get(brand) ?? [];
    if (!list.some((item) => item.url === url)) {
      list.push({
        url,
        frame: vehicle.imageFrame ?? DEFAULT_VEHICLE_IMAGE_FRAME,
      });
      byBrand.set(brand, list);
    }
  }

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

  return Array.from({ length: count }, (_, index) => visuals[index] ?? null);
}
