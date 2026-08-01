import type { PublicVehicle } from "@/src/lib/public/vehicles-types";

export type BrandGroup = {
  brand: string;
  slug: string;
  vehicles: PublicVehicle[];
};

export function slugifyBrand(brand: string) {
  return brand
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function groupVehiclesByBrand(
  vehicles: PublicVehicle[]
): BrandGroup[] {
  const map = new Map<string, PublicVehicle[]>();

  for (const vehicle of vehicles) {
    const brand = vehicle.brand.trim();
    const list = map.get(brand) ?? [];
    list.push(vehicle);
    map.set(brand, list);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([brand, brandVehicles]) => ({
      brand,
      slug: slugifyBrand(brand),
      vehicles: brandVehicles,
    }));
}
