"use client";

import Link from "next/link";
import { splitExpiringDocuments } from "@/src/lib/admin/documents-types";
import type { DocumentListItem, DocumentStats } from "@/src/lib/admin/documents-types";
import {
  getDocumentTypeLabel,
  getDocumentStatusBadgeClass,
} from "@/src/lib/documents/type";
import DocumentsListPanel from "./documents-list";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ExpiringList({
  title,
  items,
  variant,
}: {
  title: string;
  items: DocumentListItem[];
  variant: "expired" | "expiring_soon";
}) {
  return (
    <div className="space-y-3">
      <h3 className="de-section-label">{title}</h3>
      {items.length === 0 ? (
        <p className="de-empty">
          {variant === "expired"
            ? "Aucun document expiré"
            : "Aucun document expirant bientôt"}
        </p>
      ) : (
        <div className="de-list">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/documents/${item.id}`}
              className={`de-list-item block transition hover:border-[var(--blue-soft)] ${
                variant === "expired"
                  ? "border-[color-mix(in_srgb,var(--destructive)_35%,transparent)]"
                  : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium capitalize">{item.vehicle_label}</p>
                  <p className="mt-0.5 text-sm">{item.name}</p>
                  <p className="mt-0.5 text-xs de-muted">
                    {getDocumentTypeLabel(item.type)} — {item.owner_name}
                  </p>
                </div>
                <span
                  className={`de-badge ${getDocumentStatusBadgeClass(item)}`}
                >
                  {formatDate(item.expiration_date)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPanel({
  items,
  stats,
  initialVehicleId,
}: {
  items: DocumentListItem[];
  stats: DocumentStats;
  initialVehicleId?: string;
}) {
  const { expired, expiringSoon } = splitExpiringDocuments(items);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="de-card-inner">
          <p className="de-label">Total documents</p>
          <p className="de-stat-value mt-1 text-lg">{stats.total}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Documents valides</p>
          <p className="de-stat-value mt-1 text-lg text-[var(--blue-soft)]">
            {stats.valid}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Documents expirés</p>
          <p className="de-stat-value mt-1 text-lg text-[var(--destructive)]">
            {stats.expired}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Expire bientôt</p>
          <p className="de-stat-value mt-1 text-lg">{stats.expiringSoon}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ExpiringList
          title="Documents expirés"
          items={expired}
          variant="expired"
        />
        <ExpiringList
          title="Expiration proche (30 jours)"
          items={expiringSoon}
          variant="expiring_soon"
        />
      </div>

      <DocumentsListPanel items={items} initialVehicleId={initialVehicleId} />
    </div>
  );
}
