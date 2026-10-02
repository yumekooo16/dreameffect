"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelReservation,
  confirmReservation,
  finishReservation,
} from "@/src/lib/admin/reservations-actions";
import ReservationForm, {
  type ReservationVehicleRevenueConfig,
} from "./reservation-form";
import type { ReservationFormData } from "@/src/lib/admin/reservations-types";
import {
  ActionSuccessMessage,
  SuccessActionButton,
  useSuccessFeedback,
} from "@/src/components/ui/success-feedback";

type VehicleOption = { id: string; label: string };

export default function ReservationActionsPanel({
  reservationId,
  vehicles,
  revenueConfigs = [],
  initial,
  canConfirm,
  canFinish,
  canCancel,
}: {
  reservationId: string;
  vehicles: VehicleOption[];
  revenueConfigs?: ReservationVehicleRevenueConfig[];
  initial: ReservationFormData;
  canConfirm: boolean;
  canFinish: boolean;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showFinishForm, setShowFinishForm] = useState(false);
  const [finishKm, setFinishKm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { succeeded, flashSuccess, clearSuccess } = useSuccessFeedback();
  const [successKind, setSuccessKind] = useState<
    "confirm" | "finish" | "cancel" | null
  >(null);

  function runAction(
    kind: "confirm" | "finish" | "cancel",
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string
  ) {
    setMessage(null);
    setError(null);
    clearSuccess();
    setSuccessKind(null);

    startTransition(async () => {
      const result = await action();

      if (result.success) {
        setSuccessKind(kind);
        setMessage(successMessage);
        setEditing(false);
        if (kind !== "finish") {
          setShowFinishForm(false);
          setFinishKm("");
        }
        if (kind !== "cancel") {
          setConfirmCancel(false);
        }
        flashSuccess(() => {
          setShowFinishForm(false);
          setFinishKm("");
          setConfirmCancel(false);
        });
        router.refresh();
      } else {
        setError(result.error ?? "Action impossible");
      }
    });
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <ReservationForm
          vehicles={vehicles}
          revenueConfigs={revenueConfigs}
          mode="edit"
          reservationId={reservationId}
          initial={initial}
          cancelHref={`/admin/reservations/${reservationId}`}
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="de-btn de-btn-ghost"
        >
          Fermer l&apos;édition
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setConfirmCancel(false);
            setShowFinishForm(false);
            setEditing(true);
          }}
          className="de-btn de-btn-ghost"
        >
          Modifier
        </button>

        {canConfirm && (
          <SuccessActionButton
            pending={pending}
            succeeded={succeeded && successKind === "confirm"}
            onClick={() =>
              runAction(
                "confirm",
                () => confirmReservation(reservationId),
                "Réservation confirmée."
              )
            }
            idleLabel="Confirmer"
            pendingLabel="Traitement…"
            successLabel="Confirmée"
            className="de-btn de-btn-primary"
          />
        )}

        {canFinish && !showFinishForm && (
          <button
            type="button"
            disabled={pending || succeeded}
            onClick={() => setShowFinishForm(true)}
            className="de-btn de-btn-ghost"
          >
            Terminer la location
          </button>
        )}

        {canCancel && !confirmCancel && (
          <button
            type="button"
            disabled={pending || succeeded}
            onClick={() => setConfirmCancel(true)}
            className="de-btn de-btn-ghost text-destructive"
          >
            Annuler la réservation
          </button>
        )}

        {canCancel && confirmCancel && (
          <>
            <SuccessActionButton
              pending={pending}
              succeeded={succeeded && successKind === "cancel"}
              onClick={() =>
                runAction(
                  "cancel",
                  () => cancelReservation(reservationId),
                  "Réservation annulée."
                )
              }
              idleLabel="Confirmer l'annulation"
              pendingLabel="Traitement…"
              successLabel="Annulée"
              className="de-btn de-btn-ghost text-destructive"
            />
            <button
              type="button"
              disabled={pending || succeeded}
              onClick={() => setConfirmCancel(false)}
              className="de-btn de-btn-ghost"
            >
              Retour
            </button>
          </>
        )}
      </div>

      {canFinish && showFinishForm && (
        <div className="space-y-3 rounded-[var(--radius)] border border-[var(--blue-border)] p-4">
          <div>
            <label className="de-label mb-1 block">
              Km parcourus par le client
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={finishKm}
              onChange={(e) => setFinishKm(e.target.value)}
              className="de-input w-full max-w-xs"
              placeholder="Ex. 450"
            />
            <p className="mt-1 text-xs de-muted">
              Saisissez le kilométrage parcouru pendant la location
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SuccessActionButton
              pending={pending}
              succeeded={succeeded && successKind === "finish"}
              onClick={() => {
                const km = Number(finishKm.replace(/\s/g, ""));
                if (!finishKm.trim() || Number.isNaN(km) || km < 0) {
                  setError("Indiquez le kilométrage parcouru par le client");
                  return;
                }
                runAction(
                  "finish",
                  () => finishReservation(reservationId, km),
                  "Location terminée."
                );
              }}
              idleLabel="Confirmer la fin de location"
              pendingLabel="Traitement…"
              successLabel="Terminée"
              className="de-btn de-btn-primary"
            />
            <button
              type="button"
              disabled={pending || succeeded}
              onClick={() => {
                setShowFinishForm(false);
                setFinishKm("");
                setError(null);
              }}
              className="de-btn de-btn-ghost"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {confirmCancel && !succeeded && (
        <p className="text-sm de-muted">
          Annuler cette réservation ? Aucune suppression définitive.
        </p>
      )}

      {message && <ActionSuccessMessage>{message}</ActionSuccessMessage>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
