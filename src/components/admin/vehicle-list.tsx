"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  getVehicleStatusBadgeClass,
  getVehicleStatusLabel,
  VEHICLE_STATUSES,
} from "@/src/lib/vehicles/status";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import type { VehicleListItem } from "@/src/lib/admin/vehicles-types";

type StatusFilter = "all" | (typeof VEHICLE_STATUSES)[number]["value"];

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VehicleListPanel({
  vehicles,
}: {
  vehicles: VehicleListItem[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      if (statusFilter !== "all" && vehicle.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [
        vehicle.brand,
        vehicle.model,
        vehicle.owner_name,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [vehicles, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Marque, modèle ou propriétaire…"
              className="de-input w-full pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="de-input w-full sm:w-52"
          >
            <option value="all">Tous les statuts</option>
            {VEHICLE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <Link
          href="/admin/vehicules/nouveau"
          className="de-btn de-btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Plus size={16} strokeWidth={1.75} />
          Ajouter un véhicule
        </Link>
      </div>

      <p className="text-xs de-muted">
        {filtered.length} véhicule{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="de-empty">Aucun véhicule trouvé</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle) => {
            const imageUrl = resolveVehicleImageUrl(vehicle.image_url);

            return (
              <Link
                key={vehicle.id}
                href={`/admin/vehicules/${vehicle.id}`}
                className="de-card group overflow-hidden transition hover:border-[var(--blue-soft)]"
              >
                <div className="relative h-40 bg-muted">
                  {imageUrl ? (
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs de-muted">Aucune photo</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/95 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="de-display text-lg tracking-tight capitalize">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 de-card-padded pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`de-badge ${getVehicleStatusBadgeClass(vehicle.status)}`}
                    >
                      {getVehicleStatusLabel(vehicle.status)}
                    </span>
                    <span className="text-xs de-muted">
                      {vehicle.year ?? "—"} ·{" "}
                      {vehicle.mileage.toLocaleString("fr-FR")} km
                    </span>
                  </div>

                  <div>
                    <p className="de-label text-[0.6875rem]">Propriétaire</p>
                    <p className="mt-0.5 text-sm font-medium">
                      {vehicle.owner_name}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-2 border-t border-[var(--blue-border)] pt-3">
                    <div>
                      <p className="de-label text-[0.6875rem]">Ajouté le</p>
                      <p className="mt-0.5 text-xs de-muted">
                        {formatDate(vehicle.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="de-label text-[0.6875rem]">Revenus</p>
                      <p className="mt-0.5 text-sm font-medium text-[var(--blue-soft)]">
                        {formatEuro(vehicle.total_revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
