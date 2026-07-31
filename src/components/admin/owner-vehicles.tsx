"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { updateOwnerVehicleDetails } from "@/src/lib/admin/vehicles-actions";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import VehicleStatusBadge from "@/src/components/vehicle-status-badge";
import type { OwnerVehicle } from "@/src/lib/admin/owners-types";

function contractMileage(vehicle: OwnerVehicle) {
  return vehicle.initial_mileage ?? vehicle.mileage ?? null;
}

function formatKm(value?: number | null) {
  if (value == null) return "—";
  return `${value.toLocaleString("fr-FR")} km`;
}

function VehicleEditForm({ vehicle }: { vehicle: OwnerVehicle }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    year: vehicle.year != null ? String(vehicle.year) : "",
    plate: vehicle.plate ?? "",
    initial_mileage:
      contractMileage(vehicle) != null
        ? String(contractMileage(vehicle))
        : "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const parsedMileage = form.initial_mileage.trim()
      ? Number(form.initial_mileage.replace(/\s/g, ""))
      : null;

    if (
      form.initial_mileage.trim() &&
      (Number.isNaN(parsedMileage) || parsedMileage! < 0)
    ) {
      setError("Kilométrage invalide");
      return;
    }

    const parsedYear = form.year.trim() ? Number(form.year) : null;
    if (form.year.trim() && Number.isNaN(parsedYear)) {
      setError("Année invalide");
      return;
    }

    startTransition(async () => {
      const result = await updateOwnerVehicleDetails(vehicle.vehicle_id, {
        year: parsedYear,
        plate: form.plate,
        initial_mileage: parsedMileage,
      });

      if (result.success) {
        setMessage("Véhicule enregistré.");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Erreur lors de l'enregistrement.");
      }
    });
  }

  return (
    <div className="border-t border-[var(--blue-border)] px-4 py-4">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1 text-sm sm:grid-cols-3 sm:gap-4">
            <div>
              <p className="text-xs de-muted">Immatriculation</p>
              <p className="font-medium uppercase">
                {vehicle.plate?.trim() || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs de-muted">Année</p>
              <p className="font-medium">{vehicle.year ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs de-muted">Km début contrat</p>
              <p className="font-medium">{formatKm(contractMileage(vehicle))}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="de-btn de-btn-ghost text-xs"
          >
            Modifier
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="de-label mb-1 block">Immatriculation</label>
              <input
                value={form.plate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, plate: e.target.value }))
                }
                placeholder="Ex. AB-123-CD"
                className="de-input w-full uppercase"
              />
            </div>
            <div>
              <label className="de-label mb-1 block">Année</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.year}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, year: e.target.value }))
                }
                placeholder="Ex. 2022"
                className="de-input w-full"
              />
            </div>
            <div>
              <label className="de-label mb-1 block">Km au début du contrat</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.initial_mileage}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    initial_mileage: e.target.value,
                  }))
                }
                placeholder="Ex. 45 000"
                className="de-input w-full"
              />
            </div>
          </div>

          {message && (
            <p className="text-sm text-[var(--blue-soft)]">{message}</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="de-btn de-btn-primary text-sm"
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
                setMessage(null);
              }}
              className="de-btn de-btn-ghost text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function OwnerVehiclesGrid({
  vehicles,
}: {
  vehicles: OwnerVehicle[];
}) {
  if (vehicles.length === 0) {
    return <p className="de-empty">Aucun véhicule enregistré</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm de-muted">
        Renseignez l&apos;immatriculation, l&apos;année et le kilométrage au
        début du contrat pour chaque véhicule. Le statut se met à jour
        automatiquement selon les réservations.
      </p>

      <div className="space-y-4">
        {vehicles.map((vehicle) => {
          const imageUrl = resolveVehicleImageUrl(vehicle.image_url);

          return (
            <div key={vehicle.vehicle_id} className="de-card overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <Link
                  href={`/admin/vehicules/${vehicle.vehicle_id}`}
                  className="group relative h-36 shrink-0 sm:h-auto sm:w-44"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover transition group-hover:opacity-90"
                      sizes="176px"
                    />
                  ) : (
                    <div className="flex h-full min-h-36 items-center justify-center bg-muted/20">
                      <span className="text-xs de-muted">Aucune photo</span>
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 px-4 py-4">
                    <div>
                      <Link
                        href={`/admin/vehicules/${vehicle.vehicle_id}`}
                        className="de-display text-lg capitalize transition hover:text-[var(--blue-soft)]"
                      >
                        {vehicle.brand} {vehicle.model}
                      </Link>
                      <div className="mt-2">
                        <VehicleStatusBadge status={vehicle.status} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs de-muted">Revenus</p>
                      <p className="text-sm font-medium text-[var(--blue-soft)]">
                        {(vehicle.total_revenue ?? 0).toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>

                  <VehicleEditForm vehicle={vehicle} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
