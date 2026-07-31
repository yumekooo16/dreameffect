"use client";

import { useState, useTransition } from "react";
import { deactivateVehicle } from "@/src/lib/admin/vehicles-actions";
import VehicleForm from "./vehicle-form";
import type { VehicleFormData } from "@/src/lib/admin/vehicles-actions";

type OwnerOption = { id: string; label: string };

export default function VehicleActionsPanel({
  vehicleId,
  owners,
  initial,
  isUnavailable,
}: {
  vehicleId: string;
  owners: OwnerOption[];
  initial: VehicleFormData;
  isUnavailable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDeactivate() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await deactivateVehicle(vehicleId);

      if (result.success) {
        setMessage("Véhicule désactivé.");
        setConfirmDeactivate(false);
      } else {
        setError(result.error ?? "Échec de la désactivation");
      }
    });
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <VehicleForm
          owners={owners}
          mode="edit"
          vehicleId={vehicleId}
          initial={initial}
          cancelHref={`/admin/vehicules/${vehicleId}`}
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
            setConfirmDeactivate(false);
            setEditing(true);
          }}
          className="de-btn de-btn-ghost"
        >
          Modifier le véhicule
        </button>
        {!isUnavailable && !confirmDeactivate && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmDeactivate(true)}
            className="de-btn de-btn-ghost"
          >
            Désactiver le véhicule
          </button>
        )}
        {!isUnavailable && confirmDeactivate && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={handleDeactivate}
              className="de-btn de-btn-ghost text-destructive"
            >
              {pending ? "Traitement…" : "Confirmer la désactivation"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmDeactivate(false)}
              className="de-btn de-btn-ghost"
            >
              Annuler
            </button>
          </>
        )}
      </div>

      {confirmDeactivate && (
        <p className="text-sm de-muted">
          Le véhicule sera marqué comme indisponible, sans suppression.
        </p>
      )}

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
