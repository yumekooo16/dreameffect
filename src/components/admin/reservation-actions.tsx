"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelReservation,
  confirmReservation,
  finishReservation,
} from "@/src/lib/admin/reservations-actions";
import ReservationForm from "./reservation-form";
import type { ReservationFormData } from "@/src/lib/admin/reservations-types";

type VehicleOption = { id: string; label: string };

export default function ReservationActionsPanel({
  reservationId,
  vehicles,
  initial,
  canConfirm,
  canFinish,
  canCancel,
}: {
  reservationId: string;
  vehicles: VehicleOption[];
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

  function runAction(action: () => Promise<{ success: boolean; error?: string }>) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await action();

      if (result.success) {
        setMessage("Action effectuée.");
        setEditing(false);
        setConfirmCancel(false);
        setShowFinishForm(false);
        setFinishKm("");
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
          <button
            type="button"
            disabled={pending}
            onClick={() => runAction(() => confirmReservation(reservationId))}
            className="de-btn de-btn-primary"
          >
            Confirmer
          </button>
        )}

        {canFinish && !showFinishForm && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setShowFinishForm(true)}
            className="de-btn de-btn-ghost"
          >
            Terminer la location
          </button>
        )}

        {canCancel && !confirmCancel && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmCancel(true)}
            className="de-btn de-btn-ghost text-destructive"
          >
            Annuler la réservation
          </button>
        )}

        {canCancel && confirmCancel && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => runAction(() => cancelReservation(reservationId))}
              className="de-btn de-btn-ghost text-destructive"
            >
              {pending ? "Traitement…" : "Confirmer l'annulation"}
            </button>
            <button
              type="button"
              disabled={pending}
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
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const km = Number(finishKm.replace(/\s/g, ""));
                if (!finishKm.trim() || Number.isNaN(km) || km < 0) {
                  setError("Indiquez le kilométrage parcouru par le client");
                  return;
                }
                runAction(() => finishReservation(reservationId, km));
              }}
              className="de-btn de-btn-primary"
            >
              {pending ? "Traitement…" : "Confirmer la fin de location"}
            </button>
            <button
              type="button"
              disabled={pending}
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

      {confirmCancel && (
        <p className="text-sm de-muted">
          Annuler cette réservation ? Aucune suppression définitive.
        </p>
      )}

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
