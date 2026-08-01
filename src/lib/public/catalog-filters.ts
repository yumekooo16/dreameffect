import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { getLowestRentalPrice } from "@/src/lib/vehicles/pricing";

export type CatalogFilters = {
  query: string;
  brand: string;
  fuel: string;
  transmission: string;
  availableOnly: boolean;
  maxPrice: number | null;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  query: "",
  brand: "",
  fuel: "",
  transmission: "",
  availableOnly: false,
  maxPrice: null,
};

export function filterPublicVehicles(
  vehicles: PublicVehicle[],
  filters: CatalogFilters
) {
  const query = filters.query.trim().toLowerCase();

  return vehicles.filter((vehicle) => {
    if (filters.availableOnly && vehicle.status !== "available") {
      return false;
    }

    if (filters.brand && vehicle.brand !== filters.brand) {
      return false;
    }

    if (filters.fuel && vehicle.fuel !== filters.fuel) {
      return false;
    }

    if (filters.transmission && vehicle.transmission !== filters.transmission) {
      return false;
    }

    if (
      filters.maxPrice != null &&
      (() => {
        const lowest = getLowestRentalPrice(vehicle.pricing);
        return lowest != null && lowest > filters.maxPrice!;
      })()
    ) {
      return false;
    }

    if (query) {
      const haystack = `${vehicle.brand} ${vehicle.model} ${vehicle.version ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export function getCatalogFilterOptions(vehicles: PublicVehicle[]) {
  const brands = [...new Set(vehicles.map((v) => v.brand))].sort((a, b) =>
    a.localeCompare(b, "fr")
  );

  const fuels = [...new Set(vehicles.map((v) => v.fuel).filter(Boolean))] as string[];
  const transmissions = [
    ...new Set(vehicles.map((v) => v.transmission).filter(Boolean)),
  ] as string[];

  const prices = vehicles
    .map((v) => getLowestRentalPrice(v.pricing))
    .filter((rate): rate is number => rate != null && rate > 0);

  const maxDailyRate = prices.length ? Math.max(...prices) : null;

  return { brands, fuels, transmissions, maxDailyRate };
}
