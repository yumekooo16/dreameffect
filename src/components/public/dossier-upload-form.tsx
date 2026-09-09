"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { submitReservationDossier } from "@/src/lib/public/dossier-actions";
import {
  RESERVATION_DOC_TYPES,
  getReservationDocTypeLabel,
  type ReservationDocType,
} from "@/src/lib/reservations/client-docs";

type Props = {
  token: string;
  uploadedTypes: ReservationDocType[];
};

export default function DossierUploadForm({ token, uploadedTypes }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    formData.set("token", token);

    startTransition(async () => {
      const result = await submitReservationDossier(formData);
      if (!result.success) {
        setError(result.error ?? "Envoi impossible");
        return;
      }
      setSuccess(
        result.docsStatus === "complete"
          ? "Dossier complet reçu. DreamEffect vous recontacte rapidement."
          : "Documents bien reçus. Vous pouvez encore compléter les pièces manquantes."
      );
      event.currentTarget.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="de-dossier-form space-y-5">
      {RESERVATION_DOC_TYPES.map((doc) => {
        const already = uploadedTypes.includes(doc.value);
        return (
          <label key={doc.value} className="de-dossier-field">
            <span className="de-dossier-field-label">
              {doc.label}
              {already ? (
                <span className="de-dossier-pill">Déjà reçu — remplacer ?</span>
              ) : null}
            </span>
            <span className="de-dossier-field-hint">{doc.shortLabel}</span>
            <input
              type="file"
              name={doc.fieldName}
              accept="image/jpeg,image/png,image/webp,application/pdf,.pdf,.jpg,.jpeg,.png,.webp"
              className="de-input"
            />
          </label>
        );
      })}

      <button
        type="submit"
        className="de-btn de-btn-primary de-dossier-submit"
        disabled={pending}
      >
        <Upload className="size-4" aria-hidden />
        {pending ? "Envoi…" : "Envoyer mes documents"}
      </button>

      {success && (
        <p className="de-dossier-success" role="status">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          {success}
        </p>
      )}
      {error && (
        <p className="de-dossier-error" role="alert">
          {error}
        </p>
      )}

      <p className="de-dossier-note">
        Formats acceptés : JPG, PNG, WebP, PDF — 5 Mo max par fichier. Les pièces
        déjà reçues :{" "}
        {uploadedTypes.length > 0
          ? uploadedTypes
              .map((type) => getReservationDocTypeLabel(type))
              .join(", ")
          : "aucune pour l’instant"}
        .
      </p>
    </form>
  );
}
