"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import LazyWhenVisible from "@/src/components/owner/lazy-when-visible";
import FinanceFilters, {
  EMPTY_FILTERS,
  type FinanceFiltersState,
} from "./finance-filters";
import OwnerPayoutsSection from "./owner-payouts-section";
import {
  filterFinishedReservations,
  computeFinanceStats,
  computeMonthlyRevenues,
  computeMonthlyCommissions,
  computeVehicleFinanceList,
  computeOwnerFinanceList,
  computeFinancialHistory,
} from "@/src/lib/admin/finance-types";
import type {
  FinanceStats,
  MonthlyRevenue,
  MonthlyCommission,
  VehicleFinanceItem,
  OwnerFinanceItem,
  FinancialHistoryItem,
  OwnerPayoutRecord,
  FinanceFilterOptions,
} from "@/src/lib/admin/finance-types";
import type { ReservationRow } from "@/src/lib/admin/dashboard-data";
const FinanceRevenueChart = dynamic(
  () =>
    import("./finance-charts").then((m) => ({
      default: m.FinanceRevenueChart,
    })),
  { loading: () => <ChartSkeleton /> }
);

const FinanceCommissionChart = dynamic(
  () =>
    import("./finance-charts").then((m) => ({
      default: m.FinanceCommissionChart,
    })),
  { loading: () => <ChartSkeleton /> }
);

const FinanceVehicleComparisonChart = dynamic(
  () =>
    import("./finance-charts").then((m) => ({
      default: m.FinanceVehicleComparisonChart,
    })),
  { loading: () => <ChartSkeleton /> }
);

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

type FinanceView =
  | "overview"
  | "vehicles"
  | "owners"
  | "history"
  | "profitability"
  | "payouts";

export default function FinancePanel({
  stats,
  monthlyRevenues,
  monthlyCommissions,
  vehicleFinance,
  ownerFinance,
  history,
  payouts,
  filterOptions,
  reservations,
  vehicleOwners,
  payoutOwners,
}: {
  stats: FinanceStats;
  monthlyRevenues: MonthlyRevenue[];
  monthlyCommissions: MonthlyCommission[];
  vehicleFinance: VehicleFinanceItem[];
  ownerFinance: OwnerFinanceItem[];
  history: FinancialHistoryItem[];
  payouts: OwnerPayoutRecord[];
  filterOptions: FinanceFilterOptions;
  reservations: ReservationRow[];
  vehicleOwners: Record<string, string>;
  payoutOwners: { id: string; label: string }[];
}) {
  const [view, setView] = useState<FinanceView>("overview");
  const [filters, setFilters] = useState<FinanceFiltersState>(EMPTY_FILTERS);

  const vehicleOwnersMap = useMemo(
    () => new Map(Object.entries(vehicleOwners)),
    [vehicleOwners]
  );

  const filteredReservations = useMemo(
    () =>
      filterFinishedReservations(reservations, filters, vehicleOwnersMap),
    [reservations, filters, vehicleOwnersMap]
  );

  const filteredStats = useMemo(() => {
    const vehicles = vehicleFinance.map((v) => ({
      vehicle_id: v.vehicle_id,
      total_revenue: v.total_revenue,
      status: "available",
    }));
    return computeFinanceStats(filteredReservations, vehicles);
  }, [filteredReservations, vehicleFinance]);

  const filteredMonthlyRevenues = useMemo(
    () => computeMonthlyRevenues(filteredReservations),
    [filteredReservations]
  );

  const filteredMonthlyCommissions = useMemo(
    () => computeMonthlyCommissions(filteredReservations),
    [filteredReservations]
  );

  const filteredVehicleFinance = useMemo(() => {
    let items = vehicleFinance;

    if (filters.vehicleId) {
      items = items.filter((v) => v.vehicle_id === filters.vehicleId);
    }
    if (filters.ownerId) {
      items = items.filter((v) => v.owner_id === filters.ownerId);
    }

    if (
      filters.month ||
      filters.year ||
      filters.periodStart ||
      filters.periodEnd
    ) {
      const maintenanceCosts = new Map(
        vehicleFinance.map((v) => [v.vehicle_id, v.maintenance_cost])
      );
      const ownerNames = new Map(
        vehicleFinance.map((v) => [v.owner_id, v.owner_name])
      );
      const vehicles = vehicleFinance.map((v) => ({
        vehicle_id: v.vehicle_id,
        brand: v.brand,
        model: v.model,
        image_url: v.image_url,
        owner_id: v.owner_id,
        total_revenue: v.total_revenue,
      }));
      items = computeVehicleFinanceList(
        vehicles,
        filteredReservations,
        maintenanceCosts,
        ownerNames
      );
    }

    return items;
  }, [vehicleFinance, filters, filteredReservations]);

  const filteredOwnerFinance = useMemo(() => {
    if (
      !filters.vehicleId &&
      !filters.ownerId &&
      !filters.month &&
      !filters.year &&
      !filters.periodStart &&
      !filters.periodEnd
    ) {
      return ownerFinance;
    }

    const owners = ownerFinance.map((o) => ({
      id: o.owner_id,
      first_name: o.owner_name.split(" ")[0] ?? null,
      last_name: o.owner_name.split(" ").slice(1).join(" ") || null,
    }));
    const vehicles = vehicleFinance.map((v) => ({
      vehicle_id: v.vehicle_id,
      owner_id: v.owner_id,
    }));

    let items = computeOwnerFinanceList(
      owners,
      vehicles,
      filteredReservations
    );

    if (filters.ownerId) {
      items = items.filter((o) => o.owner_id === filters.ownerId);
    }

    return items;
  }, [ownerFinance, vehicleFinance, filters, filteredReservations]);

  const filteredHistory = useMemo(() => {
    const vehicleLabels = new Map(
      vehicleFinance.map((v) => [
        v.vehicle_id,
        `${v.brand} ${v.model}`,
      ])
    );
    const ownerNames = new Map(
      vehicleFinance.map((v) => [v.owner_id, v.owner_name])
    );

    let items = computeFinancialHistory(
      filteredReservations,
      vehicleLabels,
      vehicleOwnersMap,
      ownerNames
    );

    if (filters.vehicleId) {
      items = items.filter((h) => h.vehicle_id === filters.vehicleId);
    }
    if (filters.ownerId) {
      items = items.filter((h) => h.owner_id === filters.ownerId);
    }

    return items;
  }, [
    filteredReservations,
    vehicleFinance,
    vehicleOwnersMap,
    filters,
  ]);

  const topVehiclesChart = useMemo(
    () =>
      filteredVehicleFinance.slice(0, 8).map((v) => ({
        label: `${v.brand} ${v.model}`,
        revenue: v.total_revenue,
      })),
    [filteredVehicleFinance]
  );

  const displayStats = useMemo(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    return hasFilters ? filteredStats : stats;
  }, [filters, filteredStats, stats]);

  const displayRevenues = useMemo(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    return hasFilters ? filteredMonthlyRevenues : monthlyRevenues;
  }, [filters, filteredMonthlyRevenues, monthlyRevenues]);

  const displayCommissions = useMemo(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    return hasFilters ? filteredMonthlyCommissions : monthlyCommissions;
  }, [filters, filteredMonthlyCommissions, monthlyCommissions]);

  const tabs: { id: FinanceView; label: string }[] = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "vehicles", label: "Par véhicule" },
    { id: "owners", label: "Par propriétaire" },
    { id: "history", label: "Historique" },
    { id: "profitability", label: "Rentabilité" },
    { id: "payouts", label: "Reversements" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="de-card-inner">
          <p className="de-label">Chiffre d&apos;affaires total</p>
          <p className="de-stat-value mt-1 text-xl">
            {formatEuro(displayStats.totalRevenue)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">CA du mois</p>
          <p className="de-stat-value mt-1 text-xl text-[var(--blue-soft)]">
            {formatEuro(displayStats.monthlyRevenue)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Revenus cette année</p>
          <p className="de-stat-value mt-1 text-xl">
            {formatEuro(displayStats.yearlyRevenue)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Commission DreamEffect totale</p>
          <p className="de-stat-value mt-1 text-xl text-[var(--blue-soft)]">
            {formatEuro(displayStats.totalCommission)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Commission DreamEffect du mois</p>
          <p className="de-stat-value mt-1 text-xl">
            {formatEuro(displayStats.monthlyCommission)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Montant total propriétaire</p>
          <p className="de-stat-value mt-1 text-xl">
            {formatEuro(displayStats.ownerRevenue)}
          </p>
        </div>
      </div>

      <FinanceFilters
        options={filterOptions}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            className={`de-btn de-btn-tab shrink-0 ${
              view === tab.id ? "de-btn-tab--active" : "de-btn-tab--inactive"
            }`}
          >
            {tab.label}
            {tab.id === "payouts" &&
              payouts.filter((p) => p.status === "pending").length > 0 && (
                <span className="ml-1 rounded-full bg-amber-500/80 px-1.5 py-0.5 text-[0.625rem] text-white">
                  {payouts.filter((p) => p.status === "pending").length}
                </span>
              )}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="de-section-label">
                Évolution du chiffre d&apos;affaires
              </h3>
              <div className="de-card de-card-padded">
                <LazyWhenVisible>
                  <FinanceRevenueChart data={displayRevenues} />
                </LazyWhenVisible>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="de-section-label">
                Évolution de la commission DreamEffect
              </h3>
              <div className="de-card de-card-padded">
                <LazyWhenVisible>
                  <FinanceCommissionChart data={displayCommissions} />
                </LazyWhenVisible>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="de-section-label">
              Véhicules les plus rentables
            </h3>
            <div className="de-card de-card-padded">
              <LazyWhenVisible>
                <FinanceVehicleComparisonChart data={topVehiclesChart} />
              </LazyWhenVisible>
            </div>
          </div>
        </div>
      )}

      {view === "vehicles" && (
        <div className="space-y-3">
          {filteredVehicleFinance.length === 0 ? (
            <p className="de-empty">Aucun revenu enregistré</p>
          ) : (
            <div className="de-list">
              {filteredVehicleFinance.map((vehicle) => (
                <Link
                  key={vehicle.vehicle_id}
                  href={`/admin/vehicules/${vehicle.vehicle_id}`}
                  className="de-list-item block"
                >
                  <div className="flex gap-4">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted/20">
                      {vehicle.image_url ? (
                        <Image
                          src={vehicle.image_url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs de-muted">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium capitalize">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-xs de-muted">
                            {vehicle.owner_name}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-[var(--blue-soft)]">
                          {formatEuro(vehicle.total_revenue)}
                        </p>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                        <div>
                          <span className="de-muted">Locations : </span>
                          <span>{vehicle.rental_count}</span>
                        </div>
                        <div>
                          <span className="de-muted">Propriétaire : </span>
                          <span>{formatEuro(vehicle.owner_amount)}</span>
                        </div>
                        <div>
                          <span className="de-muted">DreamEffect : </span>
                          <span className="text-[var(--blue-soft)]">
                            {formatEuro(vehicle.company_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "owners" && (
        <div className="space-y-3">
          {filteredOwnerFinance.length === 0 ? (
            <p className="de-empty">Aucun propriétaire avec revenus</p>
          ) : (
            <div className="de-list">
              {filteredOwnerFinance.map((owner) => (
                <Link
                  key={owner.owner_id}
                  href={`/admin/proprietaires/${owner.owner_id}`}
                  className="de-list-item block"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{owner.owner_name}</p>
                      <p className="mt-1 text-xs de-muted">
                        {owner.vehicle_count} véhicule
                        {owner.vehicle_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--blue-soft)]">
                        {formatEuro(owner.total_revenue)}
                      </p>
                      <p className="text-xs de-muted">
                        À reverser : {formatEuro(owner.owner_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <div>
                      <span className="de-muted">Part propriétaire : </span>
                      <span>{formatEuro(owner.owner_amount)}</span>
                    </div>
                    <div>
                      <span className="de-muted">Commission DreamEffect : </span>
                      <span className="text-[var(--blue-soft)]">
                        {formatEuro(owner.company_amount)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "history" && (
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <p className="de-empty">Aucune opération financière</p>
          ) : (
            <div className="de-list">
              {filteredHistory.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/reservations/${item.reservation_id}`}
                  className="de-list-item block"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium capitalize">
                        {item.vehicle_label}
                      </p>
                      <p className="text-xs de-muted">
                        {formatDate(item.date)} — {item.owner_name}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[var(--blue-soft)]">
                      {formatEuro(item.total_price)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="de-muted">Propriétaire : </span>
                      <span>{formatEuro(item.owner_amount)}</span>
                    </div>
                    <div>
                      <span className="de-muted">DreamEffect : </span>
                      <span className="text-[var(--blue-soft)]">
                        {formatEuro(item.company_amount)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "profitability" && (
        <div className="space-y-3">
          {filteredVehicleFinance.length === 0 ? (
            <p className="de-empty">Aucune donnée de rentabilité</p>
          ) : (
            <div className="de-list">
              {filteredVehicleFinance.map((vehicle) => (
                <Link
                  key={vehicle.vehicle_id}
                  href={`/admin/vehicules/${vehicle.vehicle_id}`}
                  className="de-list-item block"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium capitalize">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-xs de-muted">
                        {vehicle.rental_count} location
                        {vehicle.rental_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        vehicle.profitability >= 0
                          ? "text-emerald-400"
                          : "text-[var(--destructive)]"
                      }`}
                    >
                      {formatEuro(vehicle.profitability)}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="de-muted">Revenus (locations)</span>
                      <span className="text-[var(--blue-soft)]">
                        + {formatEuro(vehicle.total_revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="de-muted">Coûts (maintenance)</span>
                      <span className="text-[var(--destructive)]">
                        − {formatEuro(vehicle.maintenance_cost)}
                      </span>
                    </div>
                    <div className="border-t border-[var(--blue-border)] pt-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>Rentabilité estimée</span>
                        <span
                          className={
                            vehicle.profitability >= 0
                              ? "text-emerald-400"
                              : "text-[var(--destructive)]"
                          }
                        >
                          = {formatEuro(vehicle.profitability)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "payouts" && (
        <OwnerPayoutsSection payouts={payouts} owners={payoutOwners} />
      )}
    </div>
  );
}
