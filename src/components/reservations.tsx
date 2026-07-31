"use client";



type Reservation = {

  id: string;

  start_date: string;

  end_date: string;

  customer_name?: string | null;

  customer_email?: string | null;

  status: string;

  owner_amount?: number | null;

  distance_km?: number | null;

};



function statusBadge(status: string) {

  const map: Record<string, string> = {

    pending: "de-badge--pending",

    confirmed: "de-badge--confirmed",

    finished: "de-badge--finished",

    cancelled: "de-badge--cancelled",

  };

  const labels: Record<string, string> = {

    pending: "En attente",

    confirmed: "Confirmée",

    finished: "Terminée",

    cancelled: "Annulée",

  };

  return {

    className: map[status] ?? "de-badge--finished",

    label: labels[status] ?? status,

  };

}



export default function Reservations({

  reservations,

}: {

  reservations: Reservation[];

}) {

  if (reservations.length === 0) {

    return <p className="de-empty">Aucune réservation</p>;

  }



  return (

    <div className="de-list">

      {reservations.map((reservation) => {

        const badge = statusBadge(reservation.status);



        return (

          <div key={reservation.id} className="de-list-item space-y-1.5">

            <div className="flex flex-wrap items-center justify-between gap-2">

              <p className="text-sm font-medium">

                {new Date(reservation.start_date).toLocaleDateString("fr-FR")}

                {" → "}

                {new Date(reservation.end_date).toLocaleDateString("fr-FR")}

              </p>

              <span className={`de-badge ${badge.className}`}>{badge.label}</span>

            </div>



            {reservation.customer_name && (

              <p className="text-sm de-muted">{reservation.customer_name}</p>

            )}



            {reservation.owner_amount != null && (

              <p className="text-sm de-muted">

                {reservation.owner_amount.toLocaleString("fr-FR")} €

              </p>

            )}

            {reservation.status === "finished" &&
              reservation.distance_km != null && (
                <p className="text-xs de-muted">
                  {reservation.distance_km.toLocaleString("fr-FR")} km parcourus
                </p>
              )}

          </div>

        );

      })}

    </div>

  );

}

