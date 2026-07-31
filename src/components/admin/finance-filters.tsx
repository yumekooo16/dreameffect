"use client";

import type { FinanceFilterOptions } from "@/src/lib/admin/finance-types";

export type FinanceFiltersState = {
  vehicleId: string;
  ownerId: string;
  month: string;
  year: string;
  periodStart: string;
  periodEnd: string;
};

export const EMPTY_FILTERS: FinanceFiltersState = {
  vehicleId: "",
  ownerId: "",
  month: "",
  year: "",
  periodStart: "",
  periodEnd: "",
};

export default function FinanceFilters({
  options,
  filters,
  onChange,
  onReset,
}: {
  options: FinanceFilterOptions;
  filters: FinanceFiltersState;
  onChange: (filters: FinanceFiltersState) => void;
  onReset: () => void;
}) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  function update(key: keyof FinanceFiltersState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="de-card-inner space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="de-label">Filtres</p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[var(--blue-soft)] transition hover:text-foreground"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="space-y-1">
          <span className="text-xs de-muted">Véhicule</span>
          <select
            value={filters.vehicleId}
            onChange={(e) => update("vehicleId", e.target.value)}
            className="de-input w-full text-sm"
          >
            <option value="">Tous</option>
            {options.vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs de-muted">Propriétaire</span>
          <select
            value={filters.ownerId}
            onChange={(e) => update("ownerId", e.target.value)}
            className="de-input w-full text-sm"
          >
            <option value="">Tous</option>
            {options.owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs de-muted">Mois</span>
          <select
            value={filters.month}
            onChange={(e) => update("month", e.target.value)}
            className="de-input w-full text-sm"
          >
            <option value="">Tous</option>
            {options.months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs de-muted">Année</span>
          <select
            value={filters.year}
            onChange={(e) => update("year", e.target.value)}
            className="de-input w-full text-sm"
          >
            <option value="">Toutes</option>
            {options.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs de-muted">Début période</span>
          <input
            type="date"
            value={filters.periodStart}
            onChange={(e) => update("periodStart", e.target.value)}
            className="de-input w-full text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs de-muted">Fin période</span>
          <input
            type="date"
            value={filters.periodEnd}
            onChange={(e) => update("periodEnd", e.target.value)}
            className="de-input w-full text-sm"
          />
        </label>
      </div>
    </div>
  );
}
