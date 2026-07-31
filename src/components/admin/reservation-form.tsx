"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createReservation,
  updateReservation,
} from "@/src/lib/admin/reservations-actions";
import type { ReservationFormData } from "@/src/lib/admin/reservations-types";

type VehicleOption = { id: string; label: string };

type Props = {
  vehicles: VehicleOption[];
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
          <label className="de-label mb-1 block">Client</label>
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

        <div>
          <label className="de-label mb-1 block">Prix total (€)</label>
          <input
            type="number"
            min={0}
            required
            value={form.total_price}
            onChange={(e) => updateField("total_price", Number(e.target.value))}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Part propriétaire (€)</label>
          <input
            type="number"
            min={0}
            required
            value={form.owner_amount}
            onChange={(e) => updateField("owner_amount", Number(e.target.value))}
            className="de-input w-full"
          />
        </div>

        <div>
          <label className="de-label mb-1 block">Commission DreamEffect (€)</label>
          <input
            type="number"
            min={0}
            required
            value={form.company_amount}
            onChange={(e) =>
              updateField("company_amount", Number(e.target.value))
            }
            className="de-input w-full"
          />
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
              Obligatoire à la fin de la location
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
