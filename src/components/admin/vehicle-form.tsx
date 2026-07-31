"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createVehicle,
  updateVehicle,
  type VehicleFormData,
} from "@/src/lib/admin/vehicles-actions";
import { VEHICLE_STATUSES, type VehicleStatus } from "@/src/lib/vehicles/status";

type OwnerOption = { id: string; label: string };

type Props = {
  owners: OwnerOption[];
  mode: "create" | "edit";
  vehicleId?: string;
  initial?: Partial<VehicleFormData>;
  cancelHref: string;
};

const defaultForm: VehicleFormData = {
  owner_id: "",
  brand: "",
  model: "",
  version: "",
  year: null,
  plate: "",
  vin: "",
  color: "",
  mileage: 0,
  status: "available",
};

export default function VehicleForm({
  owners,
  mode,
  vehicleId,
  initial,
  cancelHref,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<VehicleFormData>({
    ...defaultForm,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateField<K extends keyof VehicleFormData>(
    key: K,
    value: VehicleFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createVehicle(form)
          : await updateVehicle(vehicleId!, form);

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue");
        return;
      }

      router.push(
        mode === "create"
          ? `/admin/vehicules/${result.id}`
          : `/admin/vehicules/${vehicleId}`
      );
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="de-label mb-1 block">Propriétaire</label>
          <select
            required
            value={form.owner_id}
            onChange={(e) => updateField("owner_id", e.target.value)}
            className="de-input w-full"
          >
            <option value="">Sélectionner un propriétaire</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="de-label mb-1 block">Marque</label>
          <input
            required
            value={form.brand}
            onChange={(e) => updateField("brand", e.target.value)}
            className="de-input w-full capitalize"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Modèle</label>
          <input
            required
            value={form.model}
            onChange={(e) => updateField("model", e.target.value)}
            className="de-input w-full capitalize"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Version</label>
          <input
            value={form.version ?? ""}
            onChange={(e) => updateField("version", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Année</label>
          <input
            type="number"
            value={form.year ?? ""}
            onChange={(e) =>
              updateField(
                "year",
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Immatriculation</label>
          <input
            value={form.plate ?? ""}
            onChange={(e) => updateField("plate", e.target.value)}
            className="de-input w-full uppercase"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Kilométrage</label>
          <input
            type="number"
            min={0}
            required
            value={form.mileage}
            onChange={(e) => updateField("mileage", Number(e.target.value))}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Couleur</label>
          <input
            value={form.color ?? ""}
            onChange={(e) => updateField("color", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Statut</label>
          <select
            value={form.status}
            onChange={(e) =>
              updateField("status", e.target.value as VehicleStatus)
            }
            className="de-input w-full"
          >
            {VEHICLE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
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
              ? "Créer le véhicule"
              : "Enregistrer"}
        </button>
        <a href={cancelHref} className="de-btn de-btn-ghost">
          Annuler
        </a>
      </div>
    </form>
  );
}
