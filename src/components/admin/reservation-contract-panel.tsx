"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  analyzeReservationDocuments,
  generateReservationContract,
  saveExtractedFields,
  validateExtractedFields,
} from "@/src/lib/admin/contract-actions";
import {
  CONTRACT_FIELD_DEFS,
  getContractFieldLabel,
  type ExtractedFieldRecord,
} from "@/src/lib/contracts/fields";
import { getContractPipelineStatusLabel } from "@/src/lib/reservations/client-docs";
import type { ReservationContractRow } from "@/src/lib/admin/contract-data";

type Props = {
  reservationId: string;
  contractStatus: string;
  fields: ExtractedFieldRecord[];
  contract: ReservationContractRow | null;
};

export default function ReservationContractPanel({
  reservationId,
  contractStatus,
  fields,
  contract,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(
    contract?.signed_url ?? null
  );
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.field_name] = field.value ?? "";
    }
    return initial;
  });

  const warnings = useMemo(
    () =>
      fields.filter(
        (field) => field.needs_review || field.inconsistency_note || !field.value
      ),
    [fields]
  );

  function run(
    action: () => Promise<{
      success: boolean;
      error?: string;
      message?: string;
      downloadUrl?: string;
    }>
  ) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Action impossible");
        return;
      }
      setMessage(result.message ?? "OK");
      if (result.downloadUrl) setDownloadUrl(result.downloadUrl);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="de-label">Pipeline contrat</p>
          <p className="mt-1 font-medium">
            {getContractPipelineStatusLabel(contractStatus)}
          </p>
          <p className="mt-1 text-xs de-muted">
            L&apos;IA extrait les données. Elle ne rédige ni ne modifie aucune
            clause du contrat avocat.
          </p>
        </div>
        {warnings.length > 0 && (
          <p className="inline-flex items-center gap-1 text-xs text-amber-700">
            <AlertTriangle className="size-3.5" />
            {warnings.length} champ(s) à vérifier
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="de-btn de-btn-secondary"
          disabled={pending}
          onClick={() => run(() => analyzeReservationDocuments(reservationId))}
        >
          <FileSearch className="size-4" />
          Analyser les documents
        </button>
        <button
          type="button"
          className="de-btn de-btn-secondary"
          disabled={pending}
          onClick={() => run(() => saveExtractedFields(reservationId, values))}
        >
          Enregistrer les champs
        </button>
        <button
          type="button"
          className="de-btn de-btn-secondary"
          disabled={pending}
          onClick={() => run(() => validateExtractedFields(reservationId))}
        >
          <ShieldCheck className="size-4" />
          Valider les informations
        </button>
        <button
          type="button"
          className="de-btn de-btn-primary"
          disabled={pending}
          onClick={() => run(() => generateReservationContract(reservationId))}
        >
          <Sparkles className="size-4" />
          Remplir le contrat
        </button>
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="de-btn de-btn-secondary"
          >
            <Download className="size-4" />
            Télécharger le PDF
          </a>
        )}
      </div>

      {message && (
        <p className="text-sm text-emerald-700 inline-flex items-center gap-1">
          <CheckCircle2 className="size-4" />
          {message}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {CONTRACT_FIELD_DEFS.map((def) => {
          const meta = fields.find((field) => field.field_name === def.name);
          return (
            <label key={def.name} className="space-y-1">
              <span className="de-label flex items-center justify-between gap-2">
                {getContractFieldLabel(def.name)}
                {meta?.needs_review ? (
                  <span className="text-[10px] uppercase tracking-wide text-amber-700">
                    À vérifier
                  </span>
                ) : null}
              </span>
              <input
                className="de-input"
                value={values[def.name] ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    [def.name]: event.target.value,
                  }))
                }
                placeholder="—"
              />
              <span className="block text-[11px] de-muted">
                Source : {meta?.source_document ?? "—"} · Confiance :{" "}
                {meta?.confidence ?? "unknown"}
                {meta?.inconsistency_note
                  ? ` · ⚠ ${meta.inconsistency_note}`
                  : ""}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
