import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";

/** Image hero : variable d'environnement, puis première photo de flotte disponible. */
export function resolveHeroImageUrl(vehicles: PublicVehicle[] = []): string | null {
  const envHero = process.env.NEXT_PUBLIC_HERO_IMAGE?.trim();
  if (envHero) {
    return resolveVehicleImageUrl(envHero) ?? envHero;
  }

  for (const vehicle of vehicles) {
    const url = resolveVehicleImageUrl(vehicle.image_url);
    if (url) return url;
  }

  return null;
}

/** Jusqu'à 3 visuels pour les sections numérotées (photos flotte). */
export function pickNarrativeVisuals(vehicles: PublicVehicle[], count = 3): (string | null)[] {
  const urls: string[] = [];

  for (const vehicle of vehicles) {
    const url = resolveVehicleImageUrl(vehicle.image_url);
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
    if (urls.length >= count) break;
  }

  return Array.from({ length: count }, (_, index) => urls[index] ?? null);
}
