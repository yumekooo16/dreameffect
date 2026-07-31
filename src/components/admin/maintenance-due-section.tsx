"use client";

import Link from "next/link";
import { splitDueItems } from "@/src/lib/admin/maintenance-types";
import type { MaintenanceListItem } from "@/src/lib/admin/maintenance-types";
import {
  getMaintenanceTypeLabel,
  getMaintenanceDueBadgeClass,
} from "@/src/lib/maintenance/type";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DueList({
  title,
  items,
  variant,
}: {
  title: string;
  items: MaintenanceListItem[];
  variant: "overdue" | "due_soon";
}) {
  return (
    <div className="space-y-3">
      <h3 className="de-section-label">{title}</h3>
      {items.length === 0 ? (
        <p className="de-empty">
          {variant === "overdue"
            ? "Aucune échéance dépassée"
            : "Aucune échéance proche"}
        </p>
      ) : (
        <div className="de-list">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/maintenance/${item.id}`}
              className={`de-list-item block transition hover:border-[var(--blue-soft)] ${
                variant === "overdue"
                  ? "border-[color-mix(in_srgb,var(--destructive)_35%,transparent)]"
                  : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium capitalize">{item.vehicle_label}</p>
                  <p className="mt-0.5 text-sm">{item.title}</p>
                  <p className="mt-0.5 text-xs de-muted">
                    {getMaintenanceTypeLabel(item.type)} — {item.owner_name}
                  </p>
                </div>
                <span
                  className={`de-badge ${getMaintenanceDueBadgeClass(item.next_due_date)}`}
                >
                  {formatDate(item.next_due_date)}
                </span>
              </div>
              {item.vehicle_mileage > 0 && (
                <p className="mt-2 text-xs de-muted">
                  Kilométrage actuel :{" "}
                  {item.vehicle_mileage.toLocaleString("fr-FR")} km
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MaintenanceDueSection({
  items,
}: {
  items: MaintenanceListItem[];
}) {
  const { overdue, dueSoon } = splitDueItems(items);

  return (
    <div className="space-y-8">
      <DueList
        title="Échéances dépassées"
        items={overdue}
        variant="overdue"
      />
      <DueList
        title="Échéances proches (30 jours)"
        items={dueSoon}
        variant="due_soon"
      />
    </div>
  );
}
