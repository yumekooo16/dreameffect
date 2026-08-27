"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { CalendarDays, ChevronRight } from "lucide-react";
import {
  expandBlockedDateKeys,
  startOfDay,
} from "@/src/lib/dates/calendar-utils";
import type { VehicleAvailability } from "@/src/lib/public/availability-data";
import { getVehicleDisplayName } from "@/src/lib/public/vehicles-data";
import type { PublicVehicle } from "@/src/lib/public/vehicles-types";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import { getLowestRentalPrice, formatPriceFrom } from "@/src/lib/vehicles/pricing";

type Props = {
  vehicles: PublicVehicle[];
  selectedSlug: string | null;
  availability: VehicleAvailability | null;
};

export default function ReservationCalendar({
  vehicles,
  selectedSlug,
  availability,
}: Props) {
  const router = useRouter();
  const [month, setMonth] = useState<Date>(() => startOfDay(new Date()));

  const selected = useMemo(
    () => vehicles.find((vehicle) => vehicle.slug === selectedSlug) ?? null,
    [vehicles, selectedSlug]
  );

  const blockedKeys = useMemo(
    () =>
      availability
        ? expandBlockedDateKeys(
            availability.blockedPeriods,
            availability.maintenanceDays
          )
        : new Set<string>(),
    [availability]
  );

  const reservedDays = useMemo(
    () => Array.from(blockedKeys).map((key) => new Date(`${key}T12:00:00`)),
    [blockedKeys]
  );

  const today = useMemo(() => startOfDay(new Date()), []);

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
          Consultez les dates déjà réservées ou en maintenance. Les jours
          marqués restent indisponibles.
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
              ? `Calendrier — ${getVehicleDisplayName(selected)}`
              : "Calendrier des réservations"}
          </h2>
          <p className="de-calendar-page__lead">
            {selected
              ? "Les jours grisés sont déjà réservés ou indisponibles."
              : "Sélectionnez un véhicule ci-dessus pour afficher ses dates réservées."}
          </p>
        </div>

        {selected && availability ? (
          <div className="de-booking-calendar-wrap de-calendar-page__picker">
            <div className="de-calendar de-calendar-public">
              <DayPicker
                mode="single"
                locale={fr}
                month={month}
                onMonthChange={setMonth}
                numberOfMonths={1}
                disabled={[{ before: today }, ...reservedDays]}
                modifiers={{ unavailable: reservedDays }}
                modifiersClassNames={{ unavailable: "cal-unavailable" }}
                showOutsideDays
                fixedWeeks
              />
              <div className="de-calendar-legend">
                <span className="legend-cal-available">Disponible</span>
                <span className="legend-cal-unavailable">Réservé / indisponible</span>
              </div>
            </div>

            <div className="de-calendar-page__actions">
              <Link
                href={`${PUBLIC_ROUTES.vehicles}/${selected.slug}`}
                className="de-btn de-btn-primary"
              >
                Voir la fiche &amp; réserver
              </Link>
              <Link href={PUBLIC_ROUTES.contact} className="de-btn de-btn-ghost">
                Nous contacter
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
