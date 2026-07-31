"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  getMaintenanceDueBadgeClass,
  getMaintenanceDueLabel,
  getMaintenanceDueStatus,
  getMaintenanceTypeBadgeClass,
  getMaintenanceTypeLabel,
  MAINTENANCE_DUE_FILTERS,
  MAINTENANCE_TYPES,
  type MaintenanceDueFilter,
} from "@/src/lib/maintenance/type";
import type { MaintenanceListItem } from "@/src/lib/admin/maintenance-types";

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MaintenanceListPanel({
  items,
  initialVehicleId,
}: {
  items: MaintenanceListItem[];
  initialVehicleId?: string;
}) {
  const vehicleOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.vehicle_id, item.vehicle_label);
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  const ownerOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      if (item.owner_id) {
        map.set(item.owner_id, item.owner_name);
      }
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  const [query, setQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState(initialVehicleId ?? "all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState<MaintenanceDueFilter>("all");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      if (vehicleFilter !== "all" && item.vehicle_id !== vehicleFilter) {
        return false;
      }

      if (ownerFilter !== "all" && item.owner_id !== ownerFilter) {
        return false;
      }

      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false;
      }

      const dueStatus = getMaintenanceDueStatus(item.next_due_date);
      if (dueFilter !== "all" && dueStatus !== dueFilter) {
        return false;
      }

      if (periodStart && item.maintenance_date) {
        const start = new Date(periodStart);
        if (new Date(item.maintenance_date) < start) return false;
      }

      if (periodEnd && item.maintenance_date) {
        const end = new Date(periodEnd);
        end.setHours(23, 59, 59, 999);
        if (new Date(item.maintenance_date) > end) return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [
        item.vehicle_label,
        item.owner_name,
        item.title,
        item.description,
        item.provider,
        getMaintenanceTypeLabel(item.type),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [
    items,
    query,
    vehicleFilter,
    ownerFilter,
    typeFilter,
    dueFilter,
    periodStart,
    periodEnd,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="relative sm:col-span-2 xl:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Véhicule, propriétaire, titre…"
              className="de-input w-full pl-9"
            />
          </div>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="de-input w-full"
          >
            <option value="all">Tous les véhicules</option>
            {vehicleOptions.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>

          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="de-input w-full"
          >
            <option value="all">Tous les propriétaires</option>
            {ownerOptions.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="de-input w-full"
          >
            <option value="all">Tous les types</option>
            {MAINTENANCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value as MaintenanceDueFilter)}
            className="de-input w-full"
          >
            {MAINTENANCE_DUE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-2">
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="de-input w-full"
              aria-label="Début période"
            />
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="de-input w-full"
              aria-label="Fin période"
            />
          </div>
        </div>

        <Link
          href={
            vehicleFilter !== "all"
              ? `/admin/maintenance/nouveau?vehicule=${vehicleFilter}`
              : "/admin/maintenance/nouveau"
          }
          className="de-btn de-btn-primary inline-flex w-full items-center justify-center gap-2 xl:w-auto"
        >
          <Plus size={16} strokeWidth={1.75} />
          Ajouter une intervention
        </Link>
      </div>

      <p className="text-xs de-muted">
        {filtered.length} intervention{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="de-empty">Aucune intervention trouvée</p>
      ) : (
        <div className="de-list">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/admin/maintenance/${item.id}`}
              className="de-list-item block transition hover:border-[var(--blue-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium capitalize">{item.vehicle_label}</p>
                  <p className="mt-0.5 text-sm de-muted">{item.owner_name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`de-badge ${getMaintenanceTypeBadgeClass(item.type)}`}
                  >
                    {getMaintenanceTypeLabel(item.type)}
                  </span>
                  {item.next_due_date && (
                    <span
                      className={`de-badge ${getMaintenanceDueBadgeClass(item.next_due_date)}`}
                    >
                      {getMaintenanceDueLabel(item.next_due_date)}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-2 text-sm font-medium">{item.title}</p>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm de-muted">
                  {item.description}
                </p>
              )}

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="de-label text-[0.6875rem]">Date</p>
                  <p className="mt-0.5 text-sm">
                    {formatDate(item.maintenance_date)}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Kilométrage</p>
                  <p className="mt-0.5 text-sm">
                    {item.mileage != null
                      ? `${item.mileage.toLocaleString("fr-FR")} km`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Prochaine échéance</p>
                  <p className="mt-0.5 text-sm">
                    {formatDate(item.next_due_date)}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Coût</p>
                  <p className="mt-0.5 text-sm">{formatEuro(item.cost)}</p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Prestataire</p>
                  <p className="mt-0.5 text-sm">{item.provider ?? "—"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
