"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteReservation } from "@/src/lib/admin/reservations-actions";

type Props = {
  reservationId: string;
  customerName: string;
};

export default function ReservationDeleteButton({
  reservationId,
  customerName,
}: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteReservation(reservationId);

      if (!result.success) {
        setError(result.error ?? "Suppression impossible");
        return;
      }

      router.push("/admin/reservations");
    });
  }

  return (
    <div className="space-y-3 border-t border-[var(--border)] pt-4">
      <div>
        <p className="font-medium text-destructive">Zone de danger</p>
        <p className="mt-1 text-sm de-muted">
          Supprime définitivement cette réservation et son historique associé.
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
          Supprimer la réservation
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm de-muted">
            Supprimer la réservation de « {customerName} » ? Cette action est
            irréversible.
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
