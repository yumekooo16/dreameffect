"use client";

type Stats = {
  total_rentals: number;
  total_revenue: number;
  owner_revenue?: number;
  company_revenue?: number;
  rented_days: number;
  average_revenue?: number;
};

const statItems = (stats: Stats) => [
  { label: "Locations", value: stats.total_rentals.toLocaleString("fr-FR") },
  { label: "Revenus", value: `${stats.total_revenue.toLocaleString("fr-FR")} €` },
  { label: "Jours loués", value: stats.rented_days.toLocaleString("fr-FR") },
  {
    label: "Moyenne / location",
    value: `${(stats.average_revenue ?? 0).toLocaleString("fr-FR")} €`,
  },
];

export default function VehicleStats({
  stats,
}: {
  stats: Stats;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {statItems(stats).map((item) => (
        <div key={item.label} className="de-card-inner">
          <p className="text-xs de-muted">{item.label}</p>
          <p className="mt-1 text-lg font-medium tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
