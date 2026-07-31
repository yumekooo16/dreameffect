"use client";

import { useState, useTransition } from "react";
import { notifyOwnerOfMaintenance } from "@/src/lib/admin/maintenance-actions";
import { buildWhatsAppUrl } from "@/src/lib/constants";
import MaintenanceForm from "./maintenance-form";
import type { MaintenanceFormData } from "@/src/lib/admin/maintenance-types";

type VehicleOption = { id: string; label: string; mileage: number };

export default function MaintenanceActionsPanel({
  maintenanceId,
  vehicles,
  initial,
  ownerPhone,
}: {
  maintenanceId: string;
  vehicles: VehicleOption[];
  initial: MaintenanceFormData;
  ownerPhone?: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleNotifyOwner() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await notifyOwnerOfMaintenance(maintenanceId);

      if (result.success) {
        setMessage("Propriétaire notifié.");
      } else {
        setError(result.error ?? "Notification impossible");
      }
    });
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <MaintenanceForm
          vehicles={vehicles}
          mode="edit"
          maintenanceId={maintenanceId}
          initial={initial}
          cancelHref={`/admin/maintenance/${maintenanceId}`}
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
          onClick={() => setEditing(true)}
          className="de-btn de-btn-ghost"
        >
          Modifier
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={handleNotifyOwner}
          className="de-btn de-btn-primary"
        >
          Informer le propriétaire
        </button>

        {ownerPhone && (
          <a
            href={buildWhatsAppUrl(
              ownerPhone,
              "Bonjour, l'équipe DreamEffect vous informe qu'une intervention a été effectuée sur votre véhicule."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="de-btn de-btn-ghost"
          >
            WhatsApp propriétaire
          </a>
        )}
      </div>

      <p className="text-xs de-muted">
        Les justificatifs sont envoyés directement au propriétaire via WhatsApp.
        Cette fiche conserve uniquement les informations principales.
      </p>

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
