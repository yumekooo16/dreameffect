"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
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
import type { ReservationContractRow } from "@/src/lib/admin/contract-types";
import {
  ActionSuccessMessage,
  SuccessActionButton,
  useSuccessFeedback,
} from "@/src/components/ui/success-feedback";

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
  const [activeAction, setActiveAction] = useState<
    "analyze" | "save" | "validate" | "generate" | null
  >(null);
  const { succeeded, flashSuccess, clearSuccess } = useSuccessFeedback();
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
    kind: "analyze" | "save" | "validate" | "generate",
    action: () => Promise<{
      success: boolean;
      error?: string;
      message?: string;
      downloadUrl?: string;
    }>
  ) {
    setError(null);
    setMessage(null);
    clearSuccess();
    setActiveAction(kind);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Action impossible");
        setActiveAction(null);
        return;
      }
      setMessage(result.message ?? "Action réalisée avec succès.");
      if (result.downloadUrl) setDownloadUrl(result.downloadUrl);
      flashSuccess();
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
            Remplissez ce que vous pouvez (saisie manuelle OK). Les zones
            vides restent vides sur le PDF — vous pourrez les noter à la main.
            « Remplir le contrat » enregistre puis génère sans bloquer.
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
        <SuccessActionButton
          className="de-btn de-btn-secondary"
          pending={pending && activeAction === "analyze"}
          succeeded={succeeded && activeAction === "analyze"}
          disabled={pending}
          onClick={() =>
            run("analyze", () => analyzeReservationDocuments(reservationId))
          }
          idleLabel={
            <>
              <FileSearch className="size-4" />
              Analyser les documents
            </>
          }
          pendingLabel="Analyse…"
          successLabel="Analysé"
        />
        <SuccessActionButton
          className="de-btn de-btn-secondary"
          pending={pending && activeAction === "save"}
          succeeded={succeeded && activeAction === "save"}
          disabled={pending}
          onClick={() =>
            run("save", () => saveExtractedFields(reservationId, values))
          }
          idleLabel="Enregistrer les champs"
          pendingLabel="Enregistrement…"
          successLabel="Enregistré"
        />
        <SuccessActionButton
          className="de-btn de-btn-secondary"
          pending={pending && activeAction === "validate"}
          succeeded={succeeded && activeAction === "validate"}
          disabled={pending}
          onClick={() =>
            run("validate", () => validateExtractedFields(reservationId, values))
          }
          idleLabel={
            <>
              <ShieldCheck className="size-4" />
              Valider les informations
            </>
          }
          pendingLabel="Validation…"
          successLabel="Validé"
        />
        <SuccessActionButton
          className="de-btn de-btn-primary"
          pending={pending && activeAction === "generate"}
          succeeded={succeeded && activeAction === "generate"}
          disabled={pending}
          onClick={() =>
            run("generate", () =>
              generateReservationContract(reservationId, values)
            )
          }
          idleLabel={
            <>
              <Sparkles className="size-4" />
              Remplir le contrat
            </>
          }
          pendingLabel="Génération…"
          successLabel="Contrat prêt"
        />
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

      {message && <ActionSuccessMessage>{message}</ActionSuccessMessage>}
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
