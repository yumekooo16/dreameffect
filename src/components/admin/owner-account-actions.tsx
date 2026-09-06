"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  resendOwnerInvite,
  setOwnerAccountActive,
} from "@/src/lib/admin/owners-actions";

type Props = {
  ownerId: string;
  isActive: boolean;
  emailConfirmed: boolean;
  email?: string | null;
};

export default function OwnerAccountActions({
  ownerId,
  isActive,
  emailConfirmed,
  email,
}: Props) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggleActive() {
    setMessage(null);
    setError(null);
    setInviteLink(null);

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

  function handleResendInvite() {
    setMessage(null);
    setError(null);
    setInviteLink(null);

    startTransition(async () => {
      const result = await resendOwnerInvite(ownerId);

      if (result.success) {
        // Toujours afficher le lien si présent (secours si le mail n'arrive pas)
        if (result.inviteLink) {
          setInviteLink(result.inviteLink);
        }

        setMessage(
          result.warning ??
            (result.emailSent
              ? "Invitation renvoyée par email. Conservez aussi le lien ci-dessous si le mail n'arrive pas (indésirables)."
              : "Copiez le lien ci-dessous et envoyez-le au propriétaire (email / WhatsApp).")
        );
        router.refresh();
      } else {
        setError(result.error ?? "Impossible de renvoyer l'invitation.");
        if (result.inviteLink) setInviteLink(result.inviteLink);
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm de-muted">
        Gérer l&apos;accès du propriétaire à son espace DreamEffect.
      </p>

      {!emailConfirmed && (
        <div className="space-y-2 rounded-lg border border-[var(--blue-border)] p-3">
          <p className="text-sm">
            Email {email ? <strong>{email}</strong> : ""} non vérifié — le
            propriétaire doit accepter l&apos;invitation puis choisir son mot
            de passe.
          </p>
          <button
            type="button"
            onClick={handleResendInvite}
            disabled={pending}
            className="de-btn de-btn-primary"
          >
            {pending ? "Envoi…" : "Renvoyer l'invitation email"}
          </button>
        </div>
      )}

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
      {inviteLink && (
        <div className="space-y-1">
          <p className="de-label">Lien d&apos;invitation</p>
          <input
            readOnly
            value={inviteLink}
            className="de-input w-full text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
