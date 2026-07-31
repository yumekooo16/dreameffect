import {
  Users,
  Car,
  CarFront,
  KeyRound,
  CalendarClock,
  CalendarDays,
  TrendingUp,
  Wallet,
  Percent,
  BadgeEuro,
} from "lucide-react";
import StatCard from "./stat-card";
import type { DashboardStats } from "@/src/lib/admin/dashboard-data";

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

export default function StatsGrid({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      label: "Propriétaires",
      value: stats.ownersCount.toLocaleString("fr-FR"),
      icon: Users,
    },
    {
      label: "Véhicules",
      value: stats.vehiclesCount.toLocaleString("fr-FR"),
      icon: Car,
    },
    {
      label: "Disponibles",
      value: stats.availableVehicles.toLocaleString("fr-FR"),
      icon: CarFront,
    },
    {
      label: "Loués",
      value: stats.rentedVehicles.toLocaleString("fr-FR"),
      icon: KeyRound,
    },
    {
      label: "Réservations en cours",
      value: stats.activeReservations.toLocaleString("fr-FR"),
      icon: CalendarClock,
    },
    {
      label: "Réservations à venir",
      value: stats.upcomingReservations.toLocaleString("fr-FR"),
      icon: CalendarDays,
    },
    {
      label: "Revenus du mois",
      value: formatEuro(stats.monthlyRevenue),
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: "Revenus totaux",
      value: formatEuro(stats.totalRevenue),
      icon: Wallet,
    },
    {
      label: "Commission du mois",
      value: formatEuro(stats.monthlyCommission),
      icon: Percent,
      highlight: true,
    },
    {
      label: "Commission totale",
      value: formatEuro(stats.totalCommission),
      icon: BadgeEuro,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          highlight={item.highlight}
        />
      ))}
    </div>
  );
}
