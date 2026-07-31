"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createDocument,
  updateDocument,
} from "@/src/lib/admin/documents-actions";
import type { DocumentFormData } from "@/src/lib/admin/documents-types";
import {
  DOCUMENT_TYPES,
  type DocumentType,
} from "@/src/lib/documents/type";

type VehicleOption = { id: string; label: string; owner_id: string };

type Props = {
  vehicles: VehicleOption[];
  mode: "create" | "edit";
  documentId?: string;
  initial?: Partial<DocumentFormData>;
  cancelHref: string;
};

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function defaultNameForType(type: DocumentType) {
  if (type === "registration") return "Carte grise";
  if (type === "insurance") return "Assurance";
  if (type === "other") return "Contrôle technique";
  return "";
}

export default function DocumentForm({
  vehicles,
  mode,
  documentId,
  initial,
  cancelHref,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<DocumentFormData>({
    vehicle_id: initial?.vehicle_id ?? "",
    type: initial?.type ?? "registration",
    name: initial?.name ?? defaultNameForType(initial?.type ?? "registration"),
    expiration_date: toDateInputValue(initial?.expiration_date),
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateField<K extends keyof DocumentFormData>(
    key: K,
    value: DocumentFormData[K]
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "type") {
        const type = value as DocumentType;
        if (
          !prev.name.trim() ||
          DOCUMENT_TYPES.some((option) => option.label === prev.name.trim())
        ) {
          next.name = defaultNameForType(type);
        }
      }

      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createDocument(form)
          : await updateDocument(documentId!, form);

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue");
        return;
      }

      router.push(
        mode === "create"
          ? `/admin/documents/${result.id}`
          : `/admin/documents/${documentId}`
      );
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="de-label mb-1 block">Véhicule</label>
          <select
            required
            value={form.vehicle_id}
            onChange={(e) => updateField("vehicle_id", e.target.value)}
            className="de-input w-full"
          >
            <option value="">Sélectionner un véhicule</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="de-label mb-1 block">Type de document</label>
          <select
            required
            value={form.type}
            onChange={(e) =>
              updateField("type", e.target.value as DocumentType)
            }
            className="de-input w-full"
          >
            {DOCUMENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="de-label mb-1 block">Nom</label>
          <input
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Ex. Carte grise 2026"
            className="de-input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="de-label mb-1 block">Date d&apos;expiration</label>
          <input
            type="date"
            value={form.expiration_date}
            onChange={(e) => updateField("expiration_date", e.target.value)}
            className="de-input w-full sm:max-w-xs"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="de-btn de-btn-primary"
        >
          {pending
            ? "Enregistrement…"
            : mode === "create"
              ? "Ajouter le document"
              : "Enregistrer"}
        </button>
        <a href={cancelHref} className="de-btn de-btn-ghost">
          Annuler
        </a>
      </div>
    </form>
  );
}
