"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOwnerAccountActive } from "@/src/lib/admin/owners-actions";

type Props = {
  ownerId: string;
  isActive: boolean;
};

export default function OwnerAccountActions({
  ownerId,
  isActive,
}: Props) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggleActive() {
    setMessage(null);
    setError(null);

    const nextActive = !isActive;

    startTransition(async () => {
      const result = await setOwnerAccountActive(ownerId, nextActive);

      if (result.success) {
        setMessage(nextActive ? "Compte réactivé." : "Compte désactivé.");
        setConfirmAction(false);
        router.refresh();
      } else {
        setError(result.error ?? "Erreur lors du changement de statut.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm de-muted">
        Gérer l&apos;accès du propriétaire à son espace DreamEffect.
      </p>

      {!confirmAction ? (
        <button
          type="button"
          onClick={() => setConfirmAction(true)}
          disabled={pending}
          className={`de-btn ${isActive ? "de-btn-ghost" : "de-btn-primary"}`}
        >
          {isActive ? "Désactiver le compte" : "Réactiver le compte"}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm de-muted">
            {isActive
              ? "Le propriétaire ne pourra plus se connecter."
              : "Réactiver l'accès à l'espace propriétaire ?"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={pending}
              className={`de-btn ${isActive ? "de-btn-ghost text-destructive" : "de-btn-primary"}`}
            >
              {pending
                ? "Traitement…"
                : isActive
                  ? "Confirmer la désactivation"
                  : "Confirmer la réactivation"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmAction(false)}
              className="de-btn de-btn-ghost"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
