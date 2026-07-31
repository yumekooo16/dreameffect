"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  DOCUMENT_STATUS_FILTERS,
  DOCUMENT_TYPES,
  getDocumentStatus,
  getDocumentStatusBadgeClass,
  getDocumentStatusLabel,
  getDocumentTypeBadgeClass,
  getDocumentTypeLabel,
  type DocumentStatusFilter,
} from "@/src/lib/documents/type";
import type { DocumentListItem } from "@/src/lib/admin/documents-types";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DocumentsListPanel({
  items,
  initialVehicleId,
}: {
  items: DocumentListItem[];
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
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("all");

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

      const status = getDocumentStatus(item);
      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [
        item.vehicle_label,
        item.owner_name,
        item.name,
        getDocumentTypeLabel(item.type),
        getDocumentStatusLabel(item),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [items, query, vehicleFilter, ownerFilter, typeFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="relative sm:col-span-2 xl:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Véhicule, propriétaire, document…"
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
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DocumentStatusFilter)
            }
            className="de-input w-full"
          >
            {DOCUMENT_STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Link
          href={
            vehicleFilter !== "all"
              ? `/admin/documents/nouveau?vehicule=${vehicleFilter}`
              : "/admin/documents/nouveau"
          }
          className="de-btn de-btn-primary inline-flex w-full items-center justify-center gap-2 xl:w-auto"
        >
          <Plus size={16} strokeWidth={1.75} />
          Ajouter un document
        </Link>
      </div>

      <p className="text-xs de-muted">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="de-empty">Aucun document trouvé</p>
      ) : (
        <div className="de-list">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/admin/documents/${item.id}`}
              className="de-list-item block transition hover:border-[var(--blue-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium capitalize">{item.vehicle_label}</p>
                  <p className="mt-0.5 text-sm de-muted">{item.owner_name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`de-badge ${getDocumentTypeBadgeClass(item.type)}`}
                  >
                    {getDocumentTypeLabel(item.type)}
                  </span>
                  <span
                    className={`de-badge ${getDocumentStatusBadgeClass(item)}`}
                  >
                    {getDocumentStatusLabel(item)}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-sm font-medium">{item.name}</p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="de-label text-[0.6875rem]">Expiration</p>
                  <p className="mt-0.5 text-sm">
                    {formatDate(item.expiration_date)}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Ajouté le</p>
                  <p className="mt-0.5 text-sm">{formatDate(item.created_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
