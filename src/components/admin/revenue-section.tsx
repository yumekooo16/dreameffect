import type { DashboardStats } from "@/src/lib/admin/dashboard-data";

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

export default function RevenueSection({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      label: "Revenus du mois",
      value: formatEuro(stats.monthlyRevenue),
      highlight: true,
    },
    {
      label: "Revenus totaux",
      value: formatEuro(stats.totalRevenue),
    },
    {
      label: "Part propriétaires (mois)",
      value: formatEuro(stats.ownerMonthlyRevenue),
    },
    {
      label: "Part propriétaires (total)",
      value: formatEuro(stats.ownerRevenue),
    },
    {
      label: "Part DreamEffect (mois)",
      value: formatEuro(stats.monthlyCommission),
      highlight: true,
    },
    {
      label: "Part DreamEffect (total)",
      value: formatEuro(stats.totalCommission),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="de-card-inner">
          <p className="de-label">{item.label}</p>
          <p
            className={`de-stat-value mt-2 text-xl sm:text-2xl ${
              item.highlight ? "text-[var(--blue-soft)]" : ""
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
