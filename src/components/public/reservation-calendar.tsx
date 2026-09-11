"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight } from "lucide-react";
import VehicleBookingPanel from "@/src/components/public/vehicle-booking-panel";
import type { VehicleAvailability } from "@/src/lib/public/availability-data";
import { getVehicleDisplayName } from "@/src/lib/public/vehicles-data";
import type {
  PublicVehicle,
  PublicVehicleDetail,
} from "@/src/lib/public/vehicles-types";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import { getLowestRentalPrice, formatPriceFrom } from "@/src/lib/vehicles/pricing";

type Props = {
  vehicles: PublicVehicle[];
  selectedSlug: string | null;
  selectedVehicle: PublicVehicleDetail | null;
  availability: VehicleAvailability | null;
};

export default function ReservationCalendar({
  vehicles,
  selectedSlug,
  selectedVehicle,
  availability,
}: Props) {
  const router = useRouter();

  const selected = useMemo(
    () => vehicles.find((vehicle) => vehicle.slug === selectedSlug) ?? null,
    [vehicles, selectedSlug]
  );

  function selectVehicle(slug: string) {
    router.push(`${PUBLIC_ROUTES.calendar}?vehicule=${encodeURIComponent(slug)}`);
  }

  return (
    <div className="de-calendar-page">
      <div className="de-calendar-page__intro">
        <p className="de-label">Étape 1</p>
        <h2 className="de-display de-calendar-page__title">
          Choisissez un véhicule
        </h2>
        <p className="de-calendar-page__lead">
          Consultez les disponibilités, estimez votre location, puis envoyez
          votre demande — directement depuis cette page.
        </p>
      </div>

      {vehicles.length === 0 ? (
        <p className="de-empty">Aucun véhicule publié pour le moment.</p>
      ) : (
        <ul className="de-calendar-vehicle-list">
          {vehicles.map((vehicle) => {
            const active = vehicle.slug === selectedSlug;
            const name = getVehicleDisplayName(vehicle);
            const imageSrc = resolveVehicleImageUrl(vehicle.image_url);
            const fromPrice = formatPriceFrom(
              getLowestRentalPrice(vehicle.pricing)
            );

            return (
              <li key={vehicle.id}>
                <button
                  type="button"
                  className={`de-calendar-vehicle-card${active ? " de-calendar-vehicle-card--active" : ""}`}
                  onClick={() => selectVehicle(vehicle.slug)}
                  aria-pressed={active}
                >
                  <span className="de-calendar-vehicle-card__media">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                        unoptimized={imageSrc.includes("supabase.co")}
                        style={
                          vehicle.imageFrame
                            ? {
                                objectFit: vehicle.imageFrame.fit,
                                objectPosition: `${vehicle.imageFrame.positionX}% ${vehicle.imageFrame.positionY}%`,
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <span className="de-calendar-vehicle-card__placeholder">
                        <CalendarDays className="size-5" aria-hidden />
                      </span>
                    )}
                  </span>
                  <span className="de-calendar-vehicle-card__body">
                    <span className="de-calendar-vehicle-card__name">{name}</span>
                    {vehicle.location && (
                      <span className="de-calendar-vehicle-card__meta">
                        {vehicle.location}
                      </span>
                    )}
                    {fromPrice && (
                      <span className="de-calendar-vehicle-card__meta">
                        {fromPrice}
                      </span>
                    )}
                  </span>
                  <ChevronRight
                    className="de-calendar-vehicle-card__chevron size-4"
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="de-calendar-page__result">
        <div className="de-calendar-page__intro">
          <p className="de-label">Étape 2</p>
          <h2 className="de-display de-calendar-page__title">
            {selected
              ? `Réserver — ${getVehicleDisplayName(selected)}`
              : "Demande de réservation"}
          </h2>
          <p className="de-calendar-page__lead">
            {selected
              ? "Choisissez vos dates, consultez l'estimation et la caution, puis envoyez votre demande."
              : "Sélectionnez un véhicule ci-dessus pour afficher le calendrier et formuler une demande."}
          </p>
        </div>

        {selectedVehicle && availability ? (
          <div className="de-calendar-page__booking">
            <VehicleBookingPanel
              vehicle={selectedVehicle}
              availability={availability}
              compact
            />
            <div className="de-calendar-page__actions">
              <Link
                href={`${PUBLIC_ROUTES.vehicles}/${selectedVehicle.slug}`}
                className="de-btn de-btn-ghost"
              >
                Voir photos &amp; détails
              </Link>
            </div>
          </div>
        ) : (
          <div className="de-calendar-page__placeholder" role="status">
            <CalendarDays className="size-8 opacity-60" aria-hidden />
            <p>Choisissez un véhicule pour afficher le calendrier.</p>
          </div>
        )}
      </div>
    </div>
  );
}
