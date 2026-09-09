"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Copy, Link2, MessageCircle, ShieldCheck } from "lucide-react";
import {
  generateReservationDocsLink,
  markReservationDocsReviewed,
  revokeReservationDocsLinks,
  deleteReservationClientDocument,
} from "@/src/lib/admin/reservation-docs-actions";
import type {
  ActiveUploadToken,
  ReservationClientDocument,
} from "@/src/lib/admin/reservation-docs-data";
import {
  getReservationDocsStatusLabel,
  type ReservationDocsStatus,
} from "@/src/lib/reservations/client-docs";

type Props = {
  reservationId: string;
  docsStatus: ReservationDocsStatus | string;
  documents: ReservationClientDocument[];
  activeToken: ActiveUploadToken | null;
};

function buildShareWhatsAppUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export default function ReservationDocsPanel({
  reservationId,
  docsStatus,
  documents,
  activeToken,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  const statusLabel = useMemo(
    () => getReservationDocsStatusLabel(docsStatus),
    [docsStatus]
  );

  function run(action: () => Promise<{ success: boolean; error?: string; url?: string; whatsappMessage?: string }>) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Action impossible");
        return;
      }
      if (result.url) {
        setGeneratedUrl(result.url);
        setWhatsappMessage(result.whatsappMessage ?? null);
        setMessage("Lien généré. Copiez-le ou envoyez-le sur WhatsApp.");
      } else {
        setMessage("Mis à jour.");
        setGeneratedUrl(null);
        setWhatsappMessage(null);
      }
    });
  }

  async function copyLink() {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setMessage("Lien copié.");
    } catch {
      setError("Impossible de copier automatiquement — sélectionnez le lien.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="de-label">Statut dossier</p>
          <p className="mt-1 font-medium">{statusLabel}</p>
        </div>
        {activeToken && (
          <p className="text-xs de-muted">
            Lien actif jusqu&apos;au{" "}
            {new Date(activeToken.expires_at).toLocaleString("fr-FR")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="de-btn de-btn-primary"
          disabled={pending}
          onClick={() => run(() => generateReservationDocsLink(reservationId))}
        >
          <Link2 className="size-4" aria-hidden />
          Générer le lien documents
        </button>
        {activeToken && (
          <button
            type="button"
            className="de-btn de-btn-ghost"
            disabled={pending}
            onClick={() => run(() => revokeReservationDocsLinks(reservationId))}
          >
            Révoquer le lien
          </button>
        )}
        {docsStatus === "complete" && (
          <button
            type="button"
            className="de-btn de-btn-ghost"
            disabled={pending}
            onClick={() => run(() => markReservationDocsReviewed(reservationId))}
          >
            <ShieldCheck className="size-4" aria-hidden />
            Marquer comme vérifié
          </button>
        )}
      </div>

      {generatedUrl && (
        <div className="de-card-inner space-y-3">
          <p className="de-label">Lien à envoyer au client</p>
          <p className="break-all text-sm text-[var(--blue-soft)]">{generatedUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="de-btn de-btn-ghost" onClick={copyLink}>
              <Copy className="size-4" aria-hidden />
              Copier
            </button>
            {whatsappMessage && (
              <a
                className="de-btn de-btn-primary"
                href={buildShareWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden />
                Ouvrir WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="de-label">Documents reçus</p>
        {documents.length === 0 ? (
          <p className="text-sm de-muted">Aucun document pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="de-card-inner flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{doc.type_label}</p>
                  <p className="text-xs de-muted">
                    {doc.original_filename ?? "Fichier"} ·{" "}
                    {new Date(doc.uploaded_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doc.signed_url ? (
                    <a
                      href={doc.signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="de-btn de-btn-ghost"
                    >
                      Voir
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="de-btn de-btn-ghost"
                    disabled={pending}
                    onClick={() =>
                      run(() => deleteReservationClientDocument(doc.id))
                    }
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {message && (
        <p className="flex items-center gap-2 text-sm text-[var(--blue-soft)]">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          {message}
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
