"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createVehicle,
  updateVehicle,
  type VehicleFormData,
} from "@/src/lib/admin/vehicles-actions";
import { VEHICLE_STATUSES, type VehicleStatus } from "@/src/lib/vehicles/status";
import {
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
} from "@/src/lib/vehicles/catalog-fields";
import {
  PRICING_TIER_FIELDS,
  EMPTY_VEHICLE_PRICING,
  type VehiclePricing,
} from "@/src/lib/vehicles/pricing";
import {
  PRO_PRICING_TIER_FIELDS,
  EMPTY_VEHICLE_PRO_PRICING,
  type VehicleProPricing,
} from "@/src/lib/revenue/pro-pricing";

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
  pricing: { ...EMPTY_VEHICLE_PRICING },
  proPricing: { ...EMPTY_VEHICLE_PRO_PRICING },
  fuel: "",
  transmission: "",
  power: null,
  location: "",
  description: "",
  is_published: true,
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
    pricing: {
      ...EMPTY_VEHICLE_PRICING,
      ...initial?.pricing,
    },
    proPricing: {
      ...EMPTY_VEHICLE_PRO_PRICING,
      ...initial?.proPricing,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateField<K extends keyof VehicleFormData>(
    key: K,
    value: VehicleFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updatePricingField(key: keyof VehiclePricing, raw: string) {
    setForm((prev) => ({
      ...prev,
      pricing: {
        ...EMPTY_VEHICLE_PRICING,
        ...prev.pricing,
        [key]: raw ? Number(raw) : null,
      },
    }));
  }

  function updateProPricingField(key: keyof VehicleProPricing, raw: string) {
    setForm((prev) => ({
      ...prev,
      proPricing: {
        ...EMPTY_VEHICLE_PRO_PRICING,
        ...prev.proPricing,
        [key]: raw === "" ? null : Number(raw),
      },
    }));
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

      <div className="border-t border-[var(--border)] pt-5">
        <h3 className="de-display mb-4 text-base tracking-tight">
          Catalogue public
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="mb-3 text-sm de-muted">
              Tarifs affichés sur la fiche véhicule du site public. Laissez
              vide les formules non proposées.
            </p>
          </div>

          {PRICING_TIER_FIELDS.map((tier) => (
            <div key={tier.key}>
              <label className="de-label mb-1 block">{tier.label} (€)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.pricing?.[tier.key] ?? ""}
                onChange={(e) => updatePricingField(tier.key, e.target.value)}
                className="de-input w-full"
                placeholder="Ex. 350"
              />
              {tier.hint && (
                <p className="mt-1 text-xs de-muted">{tier.hint}</p>
              )}
            </div>
          ))}

          <div>
            <label className="de-label mb-1 block">Localisation</label>
            <input
              value={form.location ?? ""}
              onChange={(e) => updateField("location", e.target.value)}
              className="de-input w-full"
              placeholder="Ex. Paris"
            />
          </div>

          <div>
            <label className="de-label mb-1 block">Carburant</label>
            <select
              value={form.fuel ?? ""}
              onChange={(e) => updateField("fuel", e.target.value as VehicleFormData["fuel"])}
              className="de-input w-full"
            >
              <option value="">Non renseigné</option>
              {FUEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="de-label mb-1 block">Boîte de vitesses</label>
            <select
              value={form.transmission ?? ""}
              onChange={(e) =>
                updateField("transmission", e.target.value as VehicleFormData["transmission"])
              }
              className="de-input w-full"
            >
              <option value="">Non renseigné</option>
              {TRANSMISSION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="de-label mb-1 block">Puissance (ch)</label>
            <input
              type="number"
              min={0}
              value={form.power ?? ""}
              onChange={(e) =>
                updateField(
                  "power",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="de-input w-full"
              placeholder="Ex. 450"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="de-label mb-1 block">Description</label>
            <textarea
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
              className="de-input w-full"
              placeholder="Présentation du véhicule visible sur le site public…"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published ?? true}
                onChange={(e) => updateField("is_published", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--blue-border)]"
              />
              <span>Visible sur le site public</span>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <h3 className="de-display mb-4 text-base tracking-tight">
          Prix pro (propriétaire)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="mb-3 text-sm de-muted">
              Utilisé uniquement si le propriétaire est en mode « prix pro ».
              Ces montants sont le reversement automatique au propriétaire
              (indépendants des tarifs catalogue client).
            </p>
          </div>

          {PRO_PRICING_TIER_FIELDS.map((tier) => (
            <div key={tier.key}>
              <label className="de-label mb-1 block">{tier.label} (€)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.proPricing?.[tier.key] ?? ""}
                onChange={(e) =>
                  updateProPricingField(tier.key, e.target.value)
                }
                className="de-input w-full"
                placeholder="Ex. 70"
              />
              {tier.hint && (
                <p className="mt-1 text-xs de-muted">{tier.hint}</p>
              )}
            </div>
          ))}

          <div>
            <label className="de-label mb-1 block">Km inclus</label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.proPricing?.pro_included_km ?? ""}
              onChange={(e) =>
                updateProPricingField("pro_included_km", e.target.value)
              }
              className="de-input w-full"
              placeholder="200"
            />
          </div>

          <div>
            <label className="de-label mb-1 block">€ / km supplémentaire</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.proPricing?.pro_extra_km_rate ?? ""}
              onChange={(e) =>
                updateProPricingField("pro_extra_km_rate", e.target.value)
              }
              className="de-input w-full"
              placeholder="1"
            />
          </div>
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
