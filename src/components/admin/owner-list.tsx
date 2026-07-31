"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { OwnerListItem } from "@/src/lib/admin/owners-types";

type Filter = "all" | "with_vehicles" | "without_vehicles" | "active" | "inactive";

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ownerName(owner: OwnerListItem) {
  const name = [owner.first_name, owner.last_name].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

export default function OwnerListPanel({ owners }: { owners: OwnerListItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return owners.filter((owner) => {
      if (filter === "with_vehicles" && owner.vehicleCount === 0) return false;
      if (filter === "without_vehicles" && owner.vehicleCount > 0) return false;
      if (filter === "active" && !owner.isActive) return false;
      if (filter === "inactive" && owner.isActive) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        owner.first_name,
        owner.last_name,
        owner.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [owners, query, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou téléphone…"
            className="de-input w-full pl-9"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="de-input w-full sm:w-auto"
        >
          <option value="all">Tous les propriétaires</option>
          <option value="with_vehicles">Avec véhicules</option>
          <option value="without_vehicles">Sans véhicules</option>
          <option value="active">Comptes actifs</option>
          <option value="inactive">Comptes désactivés</option>
        </select>

        <Link
          href="/admin/proprietaires/nouveau"
          className="de-btn de-btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Plus size={16} strokeWidth={1.75} />
          Nouveau propriétaire
        </Link>
      </div>

      <p className="text-xs de-muted">
        {filtered.length} propriétaire{filtered.length !== 1 ? "s" : ""}
        {query ? ` pour « ${query.trim()} »` : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="de-empty">Aucun propriétaire trouvé</p>
      ) : (
        <div className="de-list">
          {filtered.map((owner) => (
            <Link
              key={owner.id}
              href={`/admin/proprietaires/${owner.id}`}
              className="de-list-item block transition hover:border-[var(--blue-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{ownerName(owner)}</p>
                    {!owner.isActive && (
                      <span className="de-badge de-badge--unavailable">
                        Désactivé
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm de-muted">
                    {owner.phone?.trim() || "Téléphone non renseigné"}
                  </p>
                </div>

                <p className="text-xs de-muted">
                  Inscrit le {formatDate(owner.created_at)}
                </p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="de-label text-[0.6875rem]">Véhicules</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {owner.vehicleCount}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Réservations</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {owner.reservationCount}
                  </p>
                </div>
                <div>
                  <p className="de-label text-[0.6875rem]">Revenus</p>
                  <p className="mt-0.5 text-sm font-medium text-[var(--blue-soft)]">
                    {formatEuro(owner.totalRevenue)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
