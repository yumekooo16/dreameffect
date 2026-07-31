"use client";

import dynamic from "next/dynamic";
import LazyWhenVisible from "@/src/components/owner/lazy-when-visible";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";
import type { OwnerRevenueStats } from "@/src/lib/admin/owners-types";

const RevenueChart = dynamic(
  () => import("@/src/components/revenue-chart"),
  { loading: () => <ChartSkeleton /> }
);

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

export default function OwnerRevenueSection({
  revenue,
}: {
  revenue: OwnerRevenueStats;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="de-card-inner">
          <p className="de-label">Revenus totaux</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl">
            {formatEuro(revenue.totalRevenue)}
          </p>
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
        <div>
          <p className="de-label mb-3">Historique</p>
          <LazyWhenVisible>
            <RevenueChart data={revenue.monthlyRevenues} />
          </LazyWhenVisible>
        </div>
      )}
    </div>
  );
}
