"use client";

import dynamic from "next/dynamic";
import LazyWhenVisible from "@/src/components/owner/lazy-when-visible";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import type { VehicleRevenueStats } from "@/src/lib/admin/vehicles-types";

const RevenueChart = dynamic(
  () => import("@/src/components/revenue-chart"),
  { loading: () => <ChartSkeleton /> }
);

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

export default function VehicleRevenueSection({
  revenue,
  rentalCount,
}: {
  revenue: VehicleRevenueStats;
  rentalCount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="de-card-inner">
          <p className="de-label">Revenus générés</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl">
            {formatEuro(revenue.totalRevenue)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Locations</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl">{rentalCount}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Part propriétaire</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl">
            {formatEuro(revenue.ownerShare)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Commission DreamEffect</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl text-[var(--blue-soft)]">
            {formatEuro(revenue.companyShare)}
          </p>
        </div>
      </div>

      {revenue.monthlyRevenues.length > 0 && (
        <LazyWhenVisible>
          <RevenueChart data={revenue.monthlyRevenues} />
        </LazyWhenVisible>
      )}
    </div>
  );
}
