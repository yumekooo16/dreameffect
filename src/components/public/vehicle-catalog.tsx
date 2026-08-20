"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import PublicVehicleCard from "@/src/components/public/public-vehicle-card";
import {
  DEFAULT_CATALOG_FILTERS,
  filterPublicVehicles,
  getCatalogFilterOptions,
  type CatalogFilters,
} from "@/src/lib/public/catalog-filters";
import { groupVehiclesByBrand } from "@/src/lib/public/group-vehicles-by-brand";
import {
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
} from "@/src/lib/vehicles/catalog-fields";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";

type VehicleCatalogProps = {
  vehicles: PublicVehicle[];
};

export default function VehicleCatalog({ vehicles }: VehicleCatalogProps) {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const options = useMemo(
    () => getCatalogFilterOptions(vehicles),
    [vehicles]
  );

  const filtered = useMemo(
    () => filterPublicVehicles(vehicles, filters),
    [vehicles, filters]
  );

  const brands = useMemo(
    () => groupVehiclesByBrand(filtered),
    [filtered]
  );

  const hasActiveFilters =
    filters.query ||
    filters.brand ||
    filters.fuel ||
    filters.transmission ||
    filters.availableOnly ||
    filters.maxPrice != null;

  function updateFilter<K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(DEFAULT_CATALOG_FILTERS);
  }

  return (
    <div className="de-catalog-page">
      <div className="de-catalog-toolbar">
        <div className="de-search-field de-catalog-search">
          <Search size={16} className="de-search-field__icon" aria-hidden />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            placeholder="Rechercher par marque ou modèle…"
            className="de-input"
            aria-label="Rechercher un véhicule"
          />
        </div>

        <button
          type="button"
          className="de-btn de-btn-ghost de-catalog-filter-toggle"
          onClick={() => setShowFilters((open) => !open)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={16} />
          Filtres
          {hasActiveFilters && <span className="de-catalog-filter-dot" />}
        </button>
      </div>

      {showFilters && (
        <div className="de-catalog-filters">
          <div className="de-catalog-filters-grid">
            <div className="de-form-field">
              <label htmlFor="filter-brand" className="de-label">
                Marque
              </label>
              <select
                id="filter-brand"
                value={filters.brand}
                onChange={(e) => updateFilter("brand", e.target.value)}
                className="de-input de-select"
              >
                <option value="">Toutes</option>
                {options.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="de-form-field">
              <label htmlFor="filter-fuel" className="de-label">
                Carburant
              </label>
              <select
                id="filter-fuel"
                value={filters.fuel}
                onChange={(e) => updateFilter("fuel", e.target.value)}
                className="de-input de-select"
              >
                <option value="">Tous</option>
                {FUEL_OPTIONS.filter((o) => options.fuels.includes(o.value)).map(
                  (option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="de-form-field">
              <label htmlFor="filter-transmission" className="de-label">
                Boîte
              </label>
              <select
                id="filter-transmission"
                value={filters.transmission}
                onChange={(e) => updateFilter("transmission", e.target.value)}
                className="de-input de-select"
              >
                <option value="">Toutes</option>
                {TRANSMISSION_OPTIONS.filter((o) =>
                  options.transmissions.includes(o.value)
                ).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="de-form-field">
              <label htmlFor="filter-price" className="de-label">
                Prix max. / jour
              </label>
              <select
                id="filter-price"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "maxPrice",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="de-input de-select"
              >
                <option value="">Sans limite</option>
                {options.maxDailyRate &&
                  [200, 350, 500, 750, 1000, 1500]
                    .filter((p) => p <= options.maxDailyRate! * 1.5)
                    .map((price) => (
                      <option key={price} value={price}>
                        {price.toLocaleString("fr-FR")} € max.
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="de-catalog-filters-actions">
            <label className="de-catalog-checkbox">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => updateFilter("availableOnly", e.target.checked)}
              />
              Disponibles uniquement
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                className="de-btn de-btn-ghost"
                onClick={resetFilters}
              >
                <X size={14} />
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      <p className="de-catalog-count">
        {filtered.length} véhicule{filtered.length > 1 ? "s" : ""}
        {hasActiveFilters ? " correspondant aux filtres" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="de-vehicles-empty">
          <p className="de-display text-lg tracking-tight">
            Aucun véhicule ne correspond
          </p>
          <p className="mt-2 max-w-md text-sm de-muted">
            Essayez d&apos;élargir votre recherche ou de retirer certains filtres.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="de-btn de-btn-primary mt-6"
              onClick={resetFilters}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="de-catalog">
          {brands.map(({ brand, slug, vehicles: brandVehicles }) => (
            <section
              key={slug}
              id={`marque-${slug}`}
              className="de-brand-section"
              aria-labelledby={`brand-title-${slug}`}
            >
              <div className="de-brand-section-header">
                <h2
                  id={`brand-title-${slug}`}
                  className="de-display de-brand-title"
                >
                  {brand}
                </h2>
                <p className="text-sm de-muted">
                  {brandVehicles.length} véhicule
                  {brandVehicles.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="de-keys-lot-list" role="list">
                {brandVehicles.map((vehicle, index) => (
                  <PublicVehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    index={index + 1}
                    variant="list"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
