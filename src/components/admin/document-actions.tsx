"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDocument } from "@/src/lib/admin/documents-actions";
import DocumentForm from "./documents-form";
import type { DocumentFormData } from "@/src/lib/admin/documents-types";

type VehicleOption = { id: string; label: string; owner_id: string };

export default function DocumentActionsPanel({
  documentId,
  documentName,
  vehicles,
  initial,
}: {
  documentId: string;
  documentName: string;
  vehicles: VehicleOption[];
  initial: DocumentFormData;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteDocument(documentId);

      if (!result.success) {
        setError(result.error ?? "Suppression impossible");
        return;
      }

      router.push("/admin/documents");
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <DocumentForm
          vehicles={vehicles}
          mode="edit"
          documentId={documentId}
          initial={initial}
          cancelHref={`/admin/documents/${documentId}`}
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
          onClick={() => {
            setConfirmDelete(false);
            setEditing(true);
          }}
          className="de-btn de-btn-primary"
        >
          Modifier
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmDelete(true)}
            className="de-btn de-btn-ghost text-destructive"
          >
            Supprimer
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>

      {confirmDelete && (
        <p className="text-sm de-muted">
          Supprimer « {documentName} » ? Cette action est définitive.
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
