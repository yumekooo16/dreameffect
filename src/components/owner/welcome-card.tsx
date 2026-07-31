import VehicleStatusBadge from "@/src/components/vehicle-status-badge";

type VehicleSummary = {
  vehicle_id: string;
  brand: string;
  model: string;
  status?: string;
};

type NextReservation = {
  start_date: string;
  end_date: string;
  brand?: string;
  model?: string;
};

type LastActivity = {
  title: string;
  date?: string;
};

type Props = {
  name: string;
  vehicles: VehicleSummary[];
  monthlyRevenue?: number;
  totalRevenue?: number;
  monthlyRentals?: number;
  nextReservation?: NextReservation | null;
  lastActivity?: LastActivity | null;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

export default function WelcomeCard({
  name,
  vehicles,
  monthlyRevenue = 0,
  totalRevenue = 0,
  monthlyRentals = 0,
  nextReservation,
  lastActivity,
}: Props) {
  return (
    <div className="de-card de-card-padded">
      <div className="space-y-6">
        <div>
          <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
            Bonjour {name} 👋
          </h1>
          <p className="mt-1 text-sm de-muted">
            Voici le suivi de votre flotte DreamEffect
          </p>
        </div>

        {vehicles.length > 0 && (
          <div className="space-y-3 border-t border-[var(--blue-border)] pt-5">
            <p className="de-label">Votre flotte</p>
            <div className="space-y-2">
              {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicle_id}
                    className="flex flex-wrap items-center justify-between gap-2 de-card-inner"
                  >
                    <span className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </span>
                    <VehicleStatusBadge status={vehicle.status} />
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="grid gap-3 border-t border-[var(--blue-border)] pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="de-card-inner">
            <p className="de-label">Prochaine réservation</p>
            {nextReservation ? (
              <>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(nextReservation.start_date)} →{" "}
                  {formatDate(nextReservation.end_date)}
                </p>
                {nextReservation.brand && (
                  <p className="mt-0.5 text-xs de-muted">
                    {nextReservation.brand} {nextReservation.model}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-1 text-sm de-muted">Aucune à venir</p>
            )}
          </div>

          <div className="de-card-inner">
            <p className="de-label">Revenus du mois</p>
            <p className="de-stat-value mt-1 text-lg sm:text-xl">
              {monthlyRevenue.toLocaleString("fr-FR")} €
            </p>
          </div>

          <div className="de-card-inner">
            <p className="de-label">Locations du mois</p>
            <p className="de-stat-value mt-1 text-lg sm:text-xl">
              {monthlyRentals}
            </p>
          </div>

          <div className="de-card-inner">
            <p className="de-label">Revenus totaux</p>
            <p className="de-stat-value mt-1 text-lg sm:text-xl">
              {totalRevenue.toLocaleString("fr-FR")} €
            </p>
          </div>
        </div>

        {lastActivity && (
          <div className="border-t border-[var(--blue-border)] pt-5">
            <p className="de-label">Dernière activité</p>
            <p className="mt-1 text-sm font-medium">{lastActivity.title}</p>
            {lastActivity.date && (
              <p className="mt-0.5 text-xs de-muted">
                {new Date(lastActivity.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
