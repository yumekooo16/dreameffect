"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createMaintenance,
  updateMaintenance,
} from "@/src/lib/admin/maintenance-actions";
import type { MaintenanceFormData } from "@/src/lib/admin/maintenance-types";
import {
  MAINTENANCE_TYPES,
  type MaintenanceType,
} from "@/src/lib/maintenance/type";

type VehicleOption = { id: string; label: string; mileage: number };

type Props = {
  vehicles: VehicleOption[];
  mode: "create" | "edit";
  maintenanceId?: string;
  initial?: Partial<MaintenanceFormData>;
  cancelHref: string;
};

const defaultForm: MaintenanceFormData = {
  vehicle_id: "",
  type: "service",
  title: "",
  description: "",
  mileage: 0,
  maintenance_date: "",
  next_due_date: "",
  cost: 0,
  provider: "",
};

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function MaintenanceForm({
  vehicles,
  mode,
  maintenanceId,
  initial,
  cancelHref,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<MaintenanceFormData>({
    ...defaultForm,
    ...initial,
    maintenance_date:
      toDateInputValue(initial?.maintenance_date) ||
      initial?.maintenance_date ||
      "",
    next_due_date:
      toDateInputValue(initial?.next_due_date) || initial?.next_due_date || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateField<K extends keyof MaintenanceFormData>(
    key: K,
    value: MaintenanceFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleVehicleChange(vehicleId: string) {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    setForm((prev) => ({
      ...prev,
      vehicle_id: vehicleId,
      mileage: vehicle?.mileage ?? prev.mileage,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: MaintenanceFormData = {
      ...form,
      maintenance_date: new Date(form.maintenance_date).toISOString(),
      next_due_date: form.next_due_date
        ? new Date(form.next_due_date).toISOString()
        : "",
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createMaintenance(payload)
          : await updateMaintenance(maintenanceId!, payload);

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue");
        return;
      }

      router.push(
        mode === "create"
          ? `/admin/maintenance/${result.id}`
          : `/admin/maintenance/${maintenanceId}`
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
            onChange={(e) => handleVehicleChange(e.target.value)}
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
          <label className="de-label mb-1 block">Type d&apos;entretien</label>
          <select
            required
            value={form.type}
            onChange={(e) =>
              updateField("type", e.target.value as MaintenanceType)
            }
            className="de-input w-full"
          >
            {MAINTENANCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="de-label mb-1 block">Titre</label>
          <input
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Ex. Vidange + filtres"
            className="de-input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="de-label mb-1 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="de-input w-full resize-y"
            placeholder="Détails de l'intervention…"
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
          <label className="de-label mb-1 block">Date d&apos;intervention</label>
          <input
            type="date"
            required
            value={form.maintenance_date}
            onChange={(e) => updateField("maintenance_date", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Prochaine échéance</label>
          <input
            type="date"
            value={form.next_due_date}
            onChange={(e) => updateField("next_due_date", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Coût (€)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.cost}
            onChange={(e) => updateField("cost", Number(e.target.value))}
            className="de-input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="de-label mb-1 block">Prestataire</label>
          <input
            value={form.provider}
            onChange={(e) => updateField("provider", e.target.value)}
            placeholder="Garage, concessionnaire…"
            className="de-input w-full"
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
              ? "Créer l'intervention"
              : "Enregistrer"}
        </button>
        <a href={cancelHref} className="de-btn de-btn-ghost">
          Annuler
        </a>
      </div>
    </form>
  );
}
