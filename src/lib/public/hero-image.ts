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

/**
 * Jusqu'à `count` visuels distincts pour les sections numérotées.
 * Alterne les marques pour éviter de répéter la même photo BMW.
 */
export function pickNarrativeVisuals(
  vehicles: PublicVehicle[],
  count = 3,
  excludeUrl?: string | null
): (string | null)[] {
  const excluded = excludeUrl ? resolveVehicleImageUrl(excludeUrl) : null;
  const byBrand = new Map<string, string[]>();

  for (const vehicle of vehicles) {
    const url = resolveVehicleImageUrl(vehicle.image_url);
    if (!url || url === excluded) continue;

    const brand = vehicle.brand.trim().toLowerCase() || "autre";
    const list = byBrand.get(brand) ?? [];
    if (!list.includes(url)) {
      list.push(url);
      byBrand.set(brand, list);
    }
  }

  const brands = Array.from(byBrand.keys());
  const urls: string[] = [];
  let guard = 0;

  while (urls.length < count && brands.length > 0 && guard < count * brands.length + 8) {
    const brand = brands[guard % brands.length];
    const list = byBrand.get(brand);
    const next = list?.shift();
    if (next && !urls.includes(next)) {
      urls.push(next);
    }
    guard += 1;
  }

  return Array.from({ length: count }, (_, index) => urls[index] ?? null);
}
