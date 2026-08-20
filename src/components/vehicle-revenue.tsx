"use client";

import RevenueChart from "@/src/components/revenue-chart";
import RevenueSplitCard from "@/src/components/owner/revenue-split-card";
import { computeRevenueSummary, resolveReservationSplit } from "@/src/lib/revenue/split";

type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  customer_name?: string | null;
  status: string;
  owner_amount?: number | null;
  company_amount?: number | null;
  total_price?: number | null;
};

type Props = {
  monthlyRevenue: number;
  totalRentals: number;
  reservations: Reservation[];
};

export default function VehicleRevenue({
  monthlyRevenue,
  totalRentals,
  reservations,
}: Props) {
  const history = reservations.filter((r) => r.status === "finished");
  const summary = computeRevenueSummary(history, { finishedOnly: false });

  const byMonth = new Map<string, number>();
  for (const r of history) {
    const date = new Date(r.end_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    const amount = resolveReservationSplit(r).ownerAmount;
    byMonth.set(key, (byMonth.get(key) ?? 0) + amount);
  }

  const chartData = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  return (
    <div className="space-y-6">
      <RevenueSplitCard
        totalRevenue={summary.totalRevenue}
        ownerShare={summary.ownerShare}
        companyShare={summary.companyShare}
        title="Répartition des revenus"
        compact
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="de-card-inner">
          <p className="de-label">Votre part ce mois</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl">
            {monthlyRevenue.toLocaleString("fr-FR")} €
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Votre part totale</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl">
            {summary.ownerShare.toLocaleString("fr-FR")} €
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Locations</p>
          <p className="de-stat-value mt-1 text-lg sm:text-xl">{totalRentals}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div>
          <p className="de-label mb-3">Évolution</p>
          <RevenueChart data={chartData} />
        </div>
      )}

      <div>
        <p className="de-label mb-3">Historique</p>
        {history.length === 0 ? (
          <p className="de-empty">Aucune location terminée</p>
        ) : (
          <div className="de-list">
            {history.map((reservation) => (
              <div
                key={reservation.id}
                className="de-list-item flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {new Date(reservation.start_date).toLocaleDateString("fr-FR")}
                    {" → "}
                    {new Date(reservation.end_date).toLocaleDateString("fr-FR")}
                  </p>
                  {reservation.customer_name && (
                    <p className="mt-0.5 text-xs de-muted">
                      {reservation.customer_name}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium text-[var(--blue-soft)]">
                  {resolveReservationSplit(reservation).ownerAmount.toLocaleString("fr-FR")} €
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
