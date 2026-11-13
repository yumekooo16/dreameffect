"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  deactivateVehicle,
  deleteVehicle,
  reactivateVehicle,
} from "@/src/lib/admin/vehicles-actions";
import VehicleForm from "./vehicle-form";
import type { VehicleFormData } from "@/src/lib/admin/vehicles-actions";

type OwnerOption = { id: string; label: string };

export default function VehicleActionsPanel({
  vehicleId,
  vehicleLabel,
  owners,
  initial,
  isUnavailable,
}: {
  vehicleId: string;
  vehicleLabel: string;
  owners: OwnerOption[];
  initial: VehicleFormData;
  isUnavailable: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmReactivate, setConfirmReactivate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resetFeedback() {
    setMessage(null);
    setError(null);
  }

  function handleDeactivate() {
    resetFeedback();

    startTransition(async () => {
      const result = await deactivateVehicle(vehicleId);

      if (!result.success) {
        setError(result.error ?? "Échec de la désactivation");
        return;
      }

      setMessage("Véhicule désactivé et retiré du catalogue.");
      setConfirmDeactivate(false);
      router.refresh();
    });
  }

  function handleReactivate() {
    resetFeedback();

    startTransition(async () => {
      const result = await reactivateVehicle(vehicleId);

      if (!result.success) {
        setError(result.error ?? "Échec de la réactivation");
        return;
      }

      setMessage("Véhicule réactivé.");
      setConfirmReactivate(false);
      router.refresh();
    });
  }

  function handleDelete() {
    resetFeedback();

    startTransition(async () => {
      const result = await deleteVehicle(vehicleId);

      if (!result.success) {
        setError(result.error ?? "Échec de la suppression");
        return;
      }

      router.push("/admin/vehicules");
      router.refresh();
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
            setConfirmReactivate(false);
            setConfirmDelete(false);
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
            onClick={() => {
              setConfirmDelete(false);
              setConfirmReactivate(false);
              setConfirmDeactivate(true);
              resetFeedback();
            }}
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

        {isUnavailable && !confirmReactivate && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setConfirmDelete(false);
              setConfirmDeactivate(false);
              setConfirmReactivate(true);
              resetFeedback();
            }}
            className="de-btn de-btn-ghost"
          >
            Réactiver le véhicule
          </button>
        )}

        {isUnavailable && confirmReactivate && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={handleReactivate}
              className="de-btn de-btn-ghost"
            >
              {pending ? "Traitement…" : "Confirmer la réactivation"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmReactivate(false)}
              className="de-btn de-btn-ghost"
            >
              Annuler
            </button>
          </>
        )}
      </div>

      {confirmDeactivate && (
        <p className="text-sm de-muted">
          Le véhicule sera marqué indisponible et retiré du site public, sans
          suppression.
        </p>
      )}

      {confirmReactivate && (
        <p className="text-sm de-muted">
          Le véhicule redeviendra disponible et pourra apparaître à nouveau sur
          le catalogue.
        </p>
      )}

      <div className="space-y-3 border-t border-[var(--border)] pt-4">
        <div>
          <p className="font-medium text-destructive">Zone de danger</p>
          <p className="mt-1 text-sm de-muted">
            Supprime définitivement le véhicule, ses photos, réservations,
            maintenances et documents associés. À utiliser quand vous n&apos;avez
            plus la voiture.
          </p>
        </div>

        {!confirmDelete ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setConfirmDeactivate(false);
              setConfirmReactivate(false);
              setConfirmDelete(true);
              resetFeedback();
            }}
            className="de-btn de-btn-ghost inline-flex items-center gap-2 text-destructive"
          >
            <Trash2 size={16} strokeWidth={1.75} />
            Supprimer le véhicule
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm de-muted">
              Supprimer « {vehicleLabel} » ? Cette action est irréversible.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="de-btn de-btn-ghost text-destructive"
              >
                {pending ? "Suppression…" : "Confirmer la suppression"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmDelete(false)}
                className="de-btn de-btn-ghost"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
