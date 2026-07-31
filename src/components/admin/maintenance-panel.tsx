"use client";

import { useState } from "react";
import MaintenanceListPanel from "./maintenance-list";
import MaintenanceDueSection from "./maintenance-due-section";
import type {
  MaintenanceCostByMonth,
  MaintenanceCostByVehicle,
  MaintenanceListItem,
  MaintenanceStats,
} from "@/src/lib/admin/maintenance-types";

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

function formatMonth(month: string) {
  return new Date(month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export default function MaintenancePanel({
  items,
  stats,
  costByVehicle,
  costByMonth,
  initialVehicleId,
}: {
  items: MaintenanceListItem[];
  stats: MaintenanceStats;
  costByVehicle: MaintenanceCostByVehicle[];
  costByMonth: MaintenanceCostByMonth[];
  initialVehicleId?: string;
}) {
  const [view, setView] = useState<"list" | "due" | "finance">("list");

  const recentItems = items
    .filter((item) => item.maintenance_date)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="de-card-inner">
          <p className="de-label">Échéances à venir</p>
          <p className="de-stat-value mt-1 text-lg">{stats.upcomingDue}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Interventions récentes</p>
          <p className="de-stat-value mt-1 text-lg">{stats.recentCount}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Véhicules à intervenir</p>
          <p className="de-stat-value mt-1 text-lg text-[var(--destructive)]">
            {stats.vehiclesNeedingIntervention}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Coût du mois</p>
          <p className="de-stat-value mt-1 text-lg text-[var(--blue-soft)]">
            {formatEuro(stats.monthlyCost)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Coût total</p>
          <p className="de-stat-value mt-1 text-lg">
            {formatEuro(stats.totalCost)}
          </p>
        </div>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`de-btn de-btn-tab ${view === "list" ? "de-btn-tab--active" : "de-btn-tab--inactive"}`}
        >
          Interventions
        </button>
        <button
          type="button"
          onClick={() => setView("due")}
          className={`de-btn de-btn-tab ${view === "due" ? "de-btn-tab--active" : "de-btn-tab--inactive"}`}
        >
          Échéances
          {(stats.overdueCount > 0 || stats.dueSoonCount > 0) && (
            <span className="ml-1 rounded-full bg-[var(--destructive)] px-1.5 py-0.5 text-[0.625rem] text-white">
              {stats.overdueCount + stats.dueSoonCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setView("finance")}
          className={`de-btn de-btn-tab ${view === "finance" ? "de-btn-tab--active" : "de-btn-tab--inactive"}`}
        >
          Finances
        </button>
      </div>

      {view === "list" && (
        <MaintenanceListPanel
          items={items}
          initialVehicleId={initialVehicleId}
        />
      )}

      {view === "due" && <MaintenanceDueSection items={items} />}

      {view === "finance" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="de-card-inner">
              <p className="de-label">Dépenses totales</p>
              <p className="de-stat-value mt-1 text-xl text-[var(--blue-soft)]">
                {formatEuro(stats.totalCost)}
              </p>
            </div>
            <div className="de-card-inner">
              <p className="de-label">Dépenses ce mois</p>
              <p className="de-stat-value mt-1 text-xl">
                {formatEuro(stats.monthlyCost)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="de-section-label">Coût par véhicule</h3>
            {costByVehicle.length === 0 ? (
              <p className="de-empty">Aucune dépense enregistrée</p>
            ) : (
              <div className="de-list">
                {costByVehicle.map((row) => (
                  <div key={row.vehicle_id} className="de-list-item">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium capitalize">{row.vehicle_label}</p>
                      <p className="text-sm text-[var(--blue-soft)]">
                        {formatEuro(row.total_cost)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs de-muted">
                      {row.intervention_count} intervention
                      {row.intervention_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="de-section-label">Coût par période</h3>
            {costByMonth.length === 0 ? (
              <p className="de-empty">Aucune dépense enregistrée</p>
            ) : (
              <div className="de-list">
                {[...costByMonth].reverse().slice(0, 12).map((row) => (
                  <div key={row.month} className="de-list-item">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium capitalize">{formatMonth(row.month)}</p>
                      <p className="text-sm text-[var(--blue-soft)]">
                        {formatEuro(row.total_cost)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs de-muted">
                      {row.intervention_count} intervention
                      {row.intervention_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === "list" && recentItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="de-section-label">Interventions récentes</h3>
          <div className="de-card de-card-padded space-y-4">
            <div className="de-list">
              {recentItems.map((item) => (
                <a
                  key={item.id}
                  href={`/admin/maintenance/${item.id}`}
                  className="de-list-item block"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize">
                      {item.vehicle_label} — {item.title}
                    </p>
                    {item.cost != null && (
                      <p className="text-sm text-[var(--blue-soft)]">
                        {formatEuro(item.cost)}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
