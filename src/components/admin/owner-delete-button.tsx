"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteOwnerAccount } from "@/src/lib/admin/owners-actions";

type Props = {
  ownerId: string;
  ownerName: string;
  vehicleCount?: number;
  reservationCount?: number;
  /** Redirige vers la liste après suppression (fiche détail) */
  redirectToList?: boolean;
  compact?: boolean;
};

export default function OwnerDeleteButton({
  ownerId,
  ownerName,
  vehicleCount = 0,
  reservationCount = 0,
  redirectToList = false,
  compact = false,
}: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteOwnerAccount(ownerId);

      if (!result.success) {
        setError(result.error ?? "Suppression impossible");
        return;
      }

      if (redirectToList) {
        router.push("/admin/proprietaires");
      }

      router.refresh();
    });
  }

  const hasLinkedData = vehicleCount > 0 || reservationCount > 0;

  if (compact) {
    return (
      <div className="shrink-0" onClick={(e) => e.preventDefault()}>
        {!confirmDelete ? (
          <button
            type="button"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
              setError(null);
            }}
            className="de-btn de-btn-ghost inline-flex items-center gap-1.5 px-2 py-1.5 text-destructive"
            aria-label={`Supprimer ${ownerName}`}
          >
            <Trash2 size={15} strokeWidth={1.75} />
            <span className="sr-only sm:not-sr-only">Supprimer</span>
          </button>
        ) : (
          <div
            className="flex flex-wrap items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="de-btn de-btn-ghost px-2 py-1.5 text-destructive"
            >
              {pending ? "…" : "Confirmer"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmDelete(false)}
              className="de-btn de-btn-ghost px-2 py-1.5"
            >
              Annuler
            </button>
          </div>
        )}
        {error && (
          <p className="mt-1 max-w-xs text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-[var(--border)] pt-4">
      <div>
        <p className="font-medium text-destructive">Zone de danger</p>
        <p className="mt-1 text-sm de-muted">
          Supprime définitivement le compte propriétaire
          {hasLinkedData
            ? ", ses véhicules, réservations et documents associés."
            : " et toutes ses données."}
        </p>
      </div>

      {!confirmDelete ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setConfirmDelete(true);
            setError(null);
          }}
          className="de-btn de-btn-ghost inline-flex items-center gap-2 text-destructive"
        >
          <Trash2 size={16} strokeWidth={1.75} />
          Supprimer le propriétaire
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm de-muted">
            Supprimer « {ownerName} » ? Cette action est irréversible.
            {hasLinkedData && (
              <>
                {" "}
                {vehicleCount} véhicule{vehicleCount !== 1 ? "s" : ""},{" "}
                {reservationCount} réservation
                {reservationCount !== 1 ? "s" : ""} seront également supprimé
                {reservationCount !== 1 ? "s" : ""}.
              </>
            )}
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

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
