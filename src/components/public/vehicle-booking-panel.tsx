"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { MessageCircle, AlertCircle, FileCheck2 } from "lucide-react";
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
  estimateBooking,
  formatEstimate,
} from "@/src/lib/public/booking-estimate";
import { formatPrice } from "@/src/lib/vehicles/pricing";
import type { PublicVehicleDetail } from "@/src/lib/public/vehicles-types";
import type { VehicleAvailability } from "@/src/lib/public/availability-data";
import { getVehicleDisplayName } from "@/src/lib/public/vehicles-data";

const BOOKING_DOCS = [
  "Pièce d'identité",
  "Permis de conduire",
  "Justificatif de domicile (-3 mois)",
] as const;

type Props = {
  vehicle: PublicVehicleDetail;
  availability: VehicleAvailability;
  /** Compact : moins de marge (ex. page calendrier). */
  compact?: boolean;
};

export default function VehicleBookingPanel({
  vehicle,
  availability,
  compact = false,
}: Props) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const vehicleName = getVehicleDisplayName(vehicle);
  const isVehicleUnavailable = vehicle.status !== "available";
  const depositLabel = formatPrice(vehicle.pricing.deposit);

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

  const estimate =
    range?.from && range?.to && durationDays != null
      ? estimateBooking(
          vehicle.pricing,
          range.from,
          range.to,
          durationDays
        )
      : null;

  const estimateTotalLabel = formatEstimate(estimate?.total ?? null);

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
      durationDays,
      estimateLabel: estimate?.label ?? null,
      estimateTotal: estimateTotalLabel,
      deposit: depositLabel,
    });

    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section
      id="reservation"
      className={`de-booking-section${compact ? " de-booking-section--compact" : ""}`}
      aria-labelledby="booking-title"
    >
      <div className="de-booking-header">
        <p className="de-label">Disponibilités</p>
        <h2 id="booking-title" className="de-display de-booking-title">
          Choisir vos dates
        </h2>
        <p className="de-booking-subtitle">
          Sélectionnez la période, consultez l&apos;estimation et la caution,
          puis envoyez votre demande sur WhatsApp. Aucun paiement en ligne —
          nous confirmons ensemble.
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
                {estimate?.unitRate != null && estimate.unitLabel && (
                  <div className="de-booking-summary-row">
                    <dt>Base tarifaire</dt>
                    <dd>
                      {formatPrice(estimate.unitRate)}
                      <span className="de-booking-unit-hint">
                        {" "}
                        / {estimate.unitLabel}
                      </span>
                    </dd>
                  </div>
                )}
                {estimateTotalLabel && (
                  <div className="de-booking-summary-row de-booking-summary-row--highlight">
                    <dt>{estimate?.label ?? "Estimation"}</dt>
                    <dd>{estimateTotalLabel}</dd>
                  </div>
                )}
                {depositLabel && (
                  <div className="de-booking-summary-row">
                    <dt>Caution</dt>
                    <dd>{depositLabel}</dd>
                  </div>
                )}
              </dl>

              <div className="de-booking-km-note">
                <p>
                  Forfait kilométrique inclus — le volume exact est confirmé
                  avec votre réservation (pas d&apos;option km illimité).
                </p>
              </div>

              <div className="de-booking-docs">
                <p className="de-label de-booking-docs-title">
                  <FileCheck2 className="size-3.5" aria-hidden />
                  Documents à prévoir
                </p>
                <ul className="de-booking-docs-list">
                  {BOOKING_DOCS.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>

              <p className="de-booking-disclaimer">
                Estimation indicative — le tarif définitif vous sera communiqué
                par DreamEffect avant confirmation.
              </p>

              <button
                type="button"
                onClick={handleWhatsAppClick}
                disabled={isVehicleUnavailable}
                className="de-btn de-btn-primary de-booking-whatsapp-btn"
              >
                <MessageCircle className="size-4" aria-hidden />
                Envoyer ma demande
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
              {depositLabel && (
                <p className="mt-4 text-sm de-muted">
                  Caution habituelle :{" "}
                  <span className="font-medium text-[var(--ink)]">
                    {depositLabel}
                  </span>
                </p>
              )}
              <div className="de-booking-docs de-booking-docs--muted">
                <p className="de-label de-booking-docs-title">
                  <FileCheck2 className="size-3.5" aria-hidden />
                  Documents à prévoir
                </p>
                <ul className="de-booking-docs-list">
                  {BOOKING_DOCS.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
