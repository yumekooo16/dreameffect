import Link from "next/link";
import type { DashboardInsights } from "@/src/lib/admin/dashboard-data";

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

function InsightCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="de-card-inner">
      <p className="de-label">{label}</p>
      <p className="de-stat-value mt-1 text-xl">{value}</p>
      {hint && <p className="mt-1 text-xs de-muted">{hint}</p>}
    </div>
  );
}

export default function AdvancedInsights({
  insights,
}: {
  insights: DashboardInsights;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="Taux d'occupation"
          value={`${insights.occupancyRate} %`}
          hint="Véhicules actuellement loués"
        />
        <InsightCard
          label="Coût maintenance total"
          value={formatEuro(insights.totalMaintenanceCost)}
        />
        <InsightCard
          label="Rentabilité estimée"
          value={formatEuro(insights.estimatedProfitability)}
          hint="CA terminé − maintenance"
        />
        <InsightCard
          label="Locations terminées"
          value={insights.finishedRentals.toLocaleString("fr-FR")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="de-label mb-2">Véhicules les plus rentables</p>
          {insights.topVehicles.length === 0 ? (
            <p className="de-empty text-sm">Aucune donnée</p>
          ) : (
            <div className="de-list">
              {insights.topVehicles.map((vehicle) => (
                <Link
                  key={vehicle.vehicle_id}
                  href={`/admin/vehicules/${vehicle.vehicle_id}`}
                  className="de-list-item block transition hover:border-[var(--blue-soft)]"
                >
                  <p className="font-medium capitalize">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-[var(--blue-soft)]">
                    {formatEuro(vehicle.profitability)} net
                  </p>
                  <p className="text-xs de-muted">
                    {formatEuro(vehicle.total_revenue)} CA ·{" "}
                    {formatEuro(vehicle.maintenance_cost)} entretien
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="de-label mb-2">Propriétaires les plus actifs</p>
          {insights.topOwners.length === 0 ? (
            <p className="de-empty text-sm">Aucune donnée</p>
          ) : (
            <div className="de-list">
              {insights.topOwners.map((owner) => (
                <Link
                  key={owner.owner_id}
                  href={`/admin/proprietaires/${owner.owner_id}`}
                  className="de-list-item block transition hover:border-[var(--blue-soft)]"
                >
                  <p className="font-medium">{owner.owner_name}</p>
                  <p className="text-sm text-[var(--blue-soft)]">
                    {formatEuro(owner.total_revenue)}
                  </p>
                  <p className="text-xs de-muted">
                    {owner.vehicle_count} véhicule
                    {owner.vehicle_count !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
