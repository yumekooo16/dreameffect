"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createReservation,
  updateReservation,
} from "@/src/lib/admin/reservations-actions";
import {
  revenueModeLabel,
  splitRevenueForContext,
  type RevenueMode,
} from "@/src/lib/revenue/split";
import type { VehicleProPricing } from "@/src/lib/revenue/pro-pricing";
import type { ReservationFormData } from "@/src/lib/admin/reservations-types";

type VehicleOption = { id: string; label: string };

export type ReservationVehicleRevenueConfig = {
  vehicleId: string;
  mode: RevenueMode;
  ownerSharePercent: number;
  proPricing: VehicleProPricing;
};

type Props = {
  vehicles: VehicleOption[];
  revenueConfigs?: ReservationVehicleRevenueConfig[];
  mode: "create" | "edit";
  reservationId?: string;
  initial?: Partial<ReservationFormData>;
  cancelHref: string;
};

const defaultForm: ReservationFormData = {
  vehicle_id: "",
  customer_name: "",
  customer_email: "",
  start_date: "",
  end_date: "",
  pickup_location: "",
  return_location: "",
  total_price: 0,
  owner_amount: 0,
  company_amount: 0,
  distance_km: null,
  status: "pending",
};

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function ReservationForm({
  vehicles,
  revenueConfigs = [],
  mode,
  reservationId,
  initial,
  cancelHref,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ReservationFormData>({
    ...defaultForm,
    ...initial,
    start_date: toLocalInputValue(initial?.start_date) || initial?.start_date || "",
    end_date: toLocalInputValue(initial?.end_date) || initial?.end_date || "",
  });
  const [distanceKmInput, setDistanceKmInput] = useState(
    initial?.distance_km != null ? String(initial.distance_km) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const configByVehicle = useMemo(() => {
    const map = new Map<string, ReservationVehicleRevenueConfig>();
    for (const config of revenueConfigs) {
      map.set(config.vehicleId, config);
    }
    return map;
  }, [revenueConfigs]);

  const activeConfig = form.vehicle_id
    ? configByVehicle.get(form.vehicle_id)
    : undefined;

  const parsedDistancePreview =
    distanceKmInput.trim() === ""
      ? null
      : Number(distanceKmInput.replace(/\s/g, ""));

  const previewSplit = useMemo(() => {
    const context = activeConfig
      ? {
          mode: activeConfig.mode,
          ownerShare: activeConfig.ownerSharePercent / 100,
          startDate: form.start_date || null,
          endDate: form.end_date || null,
          distanceKm:
            parsedDistancePreview != null &&
            !Number.isNaN(parsedDistancePreview)
              ? parsedDistancePreview
              : null,
          proPricing: activeConfig.proPricing,
        }
      : { mode: "percentage" as const, ownerShare: 0.6 };

    return splitRevenueForContext(Number(form.total_price) || 0, context);
  }, [
    activeConfig,
    form.total_price,
    form.start_date,
    form.end_date,
    parsedDistancePreview,
  ]);

  function updateField<K extends keyof ReservationFormData>(
    key: K,
    value: ReservationFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toIso(value: string) {
    return new Date(value).toISOString();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedDistance =
      distanceKmInput.trim() === ""
        ? null
        : Number(distanceKmInput.replace(/\s/g, ""));

    if (
      form.status === "finished" &&
      (parsedDistance == null || Number.isNaN(parsedDistance) || parsedDistance < 0)
    ) {
      setError("Indiquez le kilométrage parcouru par le client");
      return;
    }

    const payload: ReservationFormData = {
      ...form,
      start_date: toIso(form.start_date),
      end_date: toIso(form.end_date),
      distance_km:
        parsedDistance != null && !Number.isNaN(parsedDistance)
          ? parsedDistance
          : null,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createReservation(payload)
          : await updateReservation(reservationId!, payload);

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue");
        return;
      }

      router.push(
        mode === "create"
          ? `/admin/reservations/${result.id}`
          : `/admin/reservations/${reservationId}`
      );
      router.refresh();
    });
  }

  const ownerHint =
    previewSplit.mode === "pro_price"
      ? previewSplit.tierLabel
        ? `Prix pro — ${previewSplit.tierLabel}`
        : "Prix pro"
      : `Part propriétaire (${
          activeConfig?.ownerSharePercent ?? 60
        } %)`;

  const companyHint =
    previewSplit.mode === "pro_price"
      ? "Marge DreamEffect (CA − prix pro)"
      : `Commission DreamEffect (${
          100 - (activeConfig?.ownerSharePercent ?? 60)
        } %)`;

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
          {activeConfig && (
            <p className="mt-1 text-xs de-muted">
              Mode rémunération : {revenueModeLabel(activeConfig.mode)}
            </p>
          )}
        </div>

        <div>
          <label className="de-label mb-1 block">Nom du client</label>
          <input
            required
            value={form.customer_name}
            onChange={(e) => updateField("customer_name", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Email client</label>
          <input
            type="email"
            value={form.customer_email}
            onChange={(e) => updateField("customer_email", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Début</label>
          <input
            type="datetime-local"
            required
            value={form.start_date}
            onChange={(e) => updateField("start_date", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Fin</label>
          <input
            type="datetime-local"
            required
            value={form.end_date}
            onChange={(e) => updateField("end_date", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Lieu de récupération</label>
          <input
            value={form.pickup_location}
            onChange={(e) => updateField("pickup_location", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Lieu de retour</label>
          <input
            value={form.return_location}
            onChange={(e) => updateField("return_location", e.target.value)}
            className="de-input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="de-label mb-1 block">Prix total (€)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.total_price}
            onChange={(e) => updateField("total_price", Number(e.target.value))}
            className="de-input w-full"
          />
        </div>

        <div className="sm:col-span-2 de-card-inner">
          <p className="de-label">Répartition automatique</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs de-muted">{ownerHint}</p>
              <p className="mt-0.5 font-medium">
                {previewSplit.ownerAmount.toLocaleString("fr-FR")} €
              </p>
            </div>
            <div>
              <p className="text-xs de-muted">{companyHint}</p>
              <p className="mt-0.5 font-medium">
                {previewSplit.companyAmount.toLocaleString("fr-FR")} €
              </p>
            </div>
          </div>
          {previewSplit.mode === "pro_price" &&
            activeConfig &&
            form.start_date &&
            form.end_date && (
              <p className="mt-2 text-xs de-muted">
                Km inclus : {activeConfig.proPricing.pro_included_km ?? 200} ·{" "}
                {activeConfig.proPricing.pro_extra_km_rate ?? 1} € / km supp.
              </p>
            )}
        </div>

        {mode === "edit" && (
          <div>
            <label className="de-label mb-1 block">Statut (base)</label>
            <select
              value={form.status}
              onChange={(e) =>
                updateField(
                  "status",
                  e.target.value as ReservationFormData["status"]
                )
              }
              className="de-input w-full"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="finished">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        )}

        {mode === "edit" && (
          <div>
            <label className="de-label mb-1 block">
              Km parcourus par le client
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={distanceKmInput}
              onChange={(e) => setDistanceKmInput(e.target.value)}
              className="de-input w-full"
              placeholder="Ex. 450"
            />
            <p className="mt-1 text-xs de-muted">
              Obligatoire à la fin de la location — utilisé pour le km
              supplémentaire en mode prix pro
            </p>
          </div>
        )}
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
              ? "Créer la réservation"
              : "Enregistrer"}
        </button>
        <a href={cancelHref} className="de-btn de-btn-ghost">
          Annuler
        </a>
      </div>
    </form>
  );
}
