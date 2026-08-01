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
  {
    label: "Chiffre d'affaires total",
    value: `${stats.total_revenue.toLocaleString("fr-FR")} €`,
  },
  {
    label: "Votre part (60 %)",
    value: `${(stats.owner_revenue ?? 0).toLocaleString("fr-FR")} €`,
  },
  {
    label: "Part DreamEffect (40 %)",
    value: `${(stats.company_revenue ?? 0).toLocaleString("fr-FR")} €`,
  },
  { label: "Jours loués", value: stats.rented_days.toLocaleString("fr-FR") },
  {
    label: "Moyenne / location (votre part)",
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
