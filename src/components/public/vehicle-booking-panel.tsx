"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { MessageCircle, AlertCircle } from "lucide-react";
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from "@/src/lib/constants";
import {
  expandBlockedDateKeys,
  formatDateLongFr,
  hasFutureAvailability,
  isRangeAvailable,
  rentalDurationDays,
  startOfDay,
} from "@/src/lib/dates/calendar-utils";
import { buildBookingWhatsAppMessage } from "@/src/lib/public/booking-message";
import {
  estimateRentalTotal,
  formatEstimate,
  getInformativeDailyRate,
} from "@/src/lib/public/booking-estimate";
import { formatPrice } from "@/src/lib/vehicles/pricing";
import type { PublicVehicleDetail } from "@/src/lib/public/vehicles-types";
import type { VehicleAvailability } from "@/src/lib/public/availability-data";
import { getVehicleDisplayName } from "@/src/lib/public/vehicles-data";

type Props = {
  vehicle: PublicVehicleDetail;
  availability: VehicleAvailability;
};

export default function VehicleBookingPanel({ vehicle, availability }: Props) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const vehicleName = getVehicleDisplayName(vehicle);
  const isVehicleUnavailable = vehicle.status !== "available";

  const blockedKeys = useMemo(
    () =>
      expandBlockedDateKeys(
        availability.blockedPeriods,
        availability.maintenanceDays
      ),
    [availability]
  );

  const unavailableDays = useMemo(
    () => Array.from(blockedKeys).map((key) => new Date(`${key}T12:00:00`)),
    [blockedKeys]
  );

  const noFutureAvailability =
    !isVehicleUnavailable && !hasFutureAvailability(blockedKeys);

  const durationDays =
    range?.from && range?.to
      ? rentalDurationDays(range.from, range.to)
      : null;

  const dailyRate = getInformativeDailyRate(vehicle.pricing);
  const estimate =
    durationDays != null
      ? estimateRentalTotal(vehicle.pricing, durationDays)
      : null;

  function handleRangeSelect(next: DateRange | undefined) {
    setError(null);

    if (!next?.from) {
      setRange(next);
      return;
    }

    if (next.from && next.to) {
      if (next.to < next.from) {
        setError("La date de fin doit être postérieure à la date de début.");
        return;
      }

      if (!isRangeAvailable(next.from, next.to, blockedKeys)) {
        setError("Cette période chevauche des dates déjà indisponibles.");
        setRange({ from: next.from, to: undefined });
        return;
      }
    }

    setRange(next);
  }

  function handleWhatsAppClick() {
    if (!range?.from || !range?.to) {
      setError("Veuillez sélectionner une date de début et une date de fin.");
      return;
    }

    if (!isRangeAvailable(range.from, range.to, blockedKeys)) {
      setError("Cette période n'est plus disponible.");
      return;
    }

    const message = buildBookingWhatsAppMessage({
      vehicleName,
      startDate: range.from,
      endDate: range.to,
    });

    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="de-booking-section" aria-labelledby="booking-title">
      <div className="de-booking-header">
        <p className="de-section-eyebrow">Disponibilités</p>
        <h2 id="booking-title" className="de-display de-booking-title">
          Réserver ce véhicule
        </h2>
        <p className="de-booking-subtitle">
          Choisissez vos dates, puis adressez votre demande sur WhatsApp.
          Aucun paiement en ligne — nous finalisons ensuite avec vous.
        </p>
      </div>

      {isVehicleUnavailable && (
        <div className="de-booking-alert" role="status">
          <AlertCircle className="size-5 shrink-0" aria-hidden />
          <p>
            Ce véhicule n&apos;est pas disponible à la location pour le moment.
            Consultez le calendrier pour planifier une demande ultérieure.
          </p>
        </div>
      )}

      {noFutureAvailability && (
        <div className="de-booking-alert" role="status">
          <AlertCircle className="size-5 shrink-0" aria-hidden />
          <p>
            Aucune disponibilité n&apos;a été trouvée dans les prochains mois.
            Contactez-nous pour connaître les prochaines dates libres.
          </p>
        </div>
      )}

      <div className="de-booking-layout">
        <div className="de-booking-calendar-wrap">
          <div className="de-calendar de-calendar-public">
            <DayPicker
              mode="range"
              locale={fr}
              selected={range}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
              disabled={[{ before: today }, ...unavailableDays]}
              modifiers={{ unavailable: unavailableDays }}
              modifiersClassNames={{ unavailable: "cal-unavailable" }}
              showOutsideDays
              fixedWeeks
            />

            <div className="de-calendar-legend">
              <span className="legend-cal-available">Disponible</span>
              <span className="legend-cal-unavailable">Indisponible</span>
            </div>
          </div>
        </div>

        <div className="de-booking-summary">
          {error && (
            <div className="de-booking-error" role="alert">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          )}

          {range?.from && range?.to ? (
            <div className="de-booking-summary-card">
              <p className="de-label">Récapitulatif</p>

              <dl className="de-booking-summary-list">
                <div className="de-booking-summary-row">
                  <dt>Véhicule</dt>
                  <dd>{vehicleName}</dd>
                </div>
                <div className="de-booking-summary-row">
                  <dt>Début</dt>
                  <dd>{formatDateLongFr(range.from)}</dd>
                </div>
                <div className="de-booking-summary-row">
                  <dt>Fin</dt>
                  <dd>{formatDateLongFr(range.to)}</dd>
                </div>
                <div className="de-booking-summary-row">
                  <dt>Durée</dt>
                  <dd>
                    {durationDays}{" "}
                    {durationDays === 1 ? "jour" : "jours"}
                  </dd>
                </div>
                {dailyRate != null && (
                  <div className="de-booking-summary-row">
                    <dt>Tarif journalier</dt>
                    <dd>{formatPrice(dailyRate)}</dd>
                  </div>
                )}
                {estimate != null && (
                  <div className="de-booking-summary-row de-booking-summary-row--highlight">
                    <dt>Estimation</dt>
                    <dd>{formatEstimate(estimate)}</dd>
                  </div>
                )}
              </dl>

              <p className="de-booking-disclaimer">
                Estimation indicative — le tarif définitif vous sera communiqué
                par DreamEffect.
              </p>

              <button
                type="button"
                onClick={handleWhatsAppClick}
                disabled={isVehicleUnavailable}
                className="de-btn de-btn-primary de-booking-whatsapp-btn"
              >
                <MessageCircle className="size-4" aria-hidden />
                Réserver via WhatsApp
              </button>
            </div>
          ) : (
            <div className="de-booking-summary-empty">
              <p className="de-label">Sélection des dates</p>
              <p className="mt-2 text-sm de-muted">
                {range?.from
                  ? "Choisissez maintenant votre date de fin."
                  : "Sélectionnez une date de début, puis une date de fin sur le calendrier."}
              </p>
              {range?.from && !range?.to && (
                <p className="mt-3 text-sm">
                  Début :{" "}
                  <span className="font-medium">
                    {formatDateLongFr(range.from)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
