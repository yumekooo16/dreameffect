"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { submitReservationDossier } from "@/src/lib/public/dossier-actions";
import {
  prepareImageForUpload,
  formatUploadError,
} from "@/src/lib/admin/prepare-image-upload";
import {
  RESERVATION_DOC_TYPES,
  getReservationDocTypeLabel,
  type ReservationDocType,
} from "@/src/lib/reservations/client-docs";

type Props = {
  token: string;
  uploadedTypes: ReservationDocType[];
};

function isPdf(file: File) {
  return (
    file.type === "application/pdf" || /\.pdf$/i.test(file.name)
  );
}

export default function DossierUploadForm({ token, uploadedTypes }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = formRef.current;
    if (!form) return;

    startTransition(async () => {
      try {
        const raw = new FormData(form);
        const payload = new FormData();
        payload.set("token", token);

        let hasFile = false;

        for (const doc of RESERVATION_DOC_TYPES) {
          const value = raw.get(doc.fieldName);
          if (!(value instanceof File) || value.size <= 0) continue;

          hasFile = true;

          if (isPdf(value)) {
            if (value.size > 4.5 * 1024 * 1024) {
              setError(`${doc.label} PDF trop lourd (max ~4,5 Mo).`);
              return;
            }
            payload.set(doc.fieldName, value);
            continue;
          }

          const prepared = await prepareImageForUpload(value);
          payload.set(doc.fieldName, prepared);
        }

        if (!hasFile) {
          setError("Ajoutez au moins un document avant d'envoyer.");
          return;
        }

        const result = await submitReservationDossier(payload);
        if (!result.success) {
          setError(result.error ?? "Envoi impossible");
          return;
        }

        setSuccess(
          result.docsStatus === "complete"
            ? "Dossier complet reçu. DreamEffect vous recontacte rapidement."
            : "Documents bien reçus. Vous pouvez encore compléter les pièces manquantes."
        );
        form.reset();
      } catch (err) {
        setError(
          formatUploadError(
            err,
            "L'envoi a échoué. Réessayez avec des photos plus légères (JPG)."
          )
        );
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="de-dossier-form space-y-5"
    >
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
              accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif"
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
        {pending ? "Compression & envoi…" : "Envoyer mes documents"}
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
        Astuce iPhone : les photos sont compressées automatiquement avant
        l&apos;envoi. PDF accepté aussi (max ~4,5 Mo). Pièces déjà reçues :{" "}
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
