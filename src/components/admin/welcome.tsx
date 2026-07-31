type Props = {
  name: string;
  stats: {
    vehiclesCount: number;
    activeReservations: number;
    monthlyRevenue: number;
    alertsCount: number;
  };
};

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

function formatToday() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminWelcome({ name, stats }: Props) {
  return (
    <div className="de-card de-card-padded">
      <div className="space-y-6">
        <div>
          <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
            Bonjour {name}
          </h1>
          <p className="mt-1 text-sm de-muted">{formatToday()}</p>
          <p className="mt-2 text-sm de-muted">
            Vue d&apos;ensemble de l&apos;activité DreamEffect
          </p>
        </div>

        <div className="grid gap-3 border-t border-[var(--blue-border)] pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="de-card-inner">
            <p className="de-label">Véhicules actifs</p>
            <p className="de-stat-value mt-1 text-lg sm:text-xl">
              {stats.vehiclesCount}
            </p>
          </div>

          <div className="de-card-inner">
            <p className="de-label">Réservations en cours</p>
            <p className="de-stat-value mt-1 text-lg sm:text-xl">
              {stats.activeReservations}
            </p>
          </div>

          <div className="de-card-inner">
            <p className="de-label">Revenus du mois</p>
            <p className="de-stat-value mt-1 text-lg sm:text-xl text-[var(--blue-soft)]">
              {formatEuro(stats.monthlyRevenue)}
            </p>
          </div>

          <div className="de-card-inner">
            <p className="de-label">Actions requises</p>
            <p className="de-stat-value mt-1 text-lg sm:text-xl">
              {stats.alertsCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
