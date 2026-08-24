"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOwnerProfile } from "@/src/lib/admin/owners-actions";
import type { RevenueMode } from "@/src/lib/revenue/split";

type Props = {
  ownerId: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt?: string | null;
  role: string;
  revenueMode?: RevenueMode | null;
  ownerRevenueShare?: number | null;
};

function formatDate(date?: string | null) {
  if (!date) return "Non renseignée";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OwnerProfileForm({
  ownerId,
  firstName,
  lastName,
  phone,
  createdAt,
  role,
  revenueMode = "percentage",
  ownerRevenueShare = 0.6,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: firstName,
    last_name: lastName,
    phone,
    revenue_mode: (revenueMode ?? "percentage") as RevenueMode,
    owner_revenue_share_percent: Math.round(
      (ownerRevenueShare ?? 0.6) * 100
    ),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateOwnerProfile(ownerId, form);

      if (result.success) {
        setMessage("Informations enregistrées.");
        router.refresh();
      } else {
        setError(result.error ?? "Erreur lors de l'enregistrement.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm de-muted">
        Complétez ou mettez à jour les informations du propriétaire et son mode
        de rémunération.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="owner-first-name" className="de-label mb-1 block">
            Prénom
          </label>
          <input
            id="owner-first-name"
            type="text"
            value={form.first_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, first_name: e.target.value }))
            }
            placeholder="Ex. Jean"
            className="de-input w-full"
          />
        </div>

        <div>
          <label htmlFor="owner-last-name" className="de-label mb-1 block">
            Nom
          </label>
          <input
            id="owner-last-name"
            type="text"
            value={form.last_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, last_name: e.target.value }))
            }
            placeholder="Ex. Dupont"
            className="de-input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="owner-phone" className="de-label mb-1 block">
            Téléphone
          </label>
          <input
            id="owner-phone"
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Ex. 06 12 34 56 78"
            className="de-input w-full"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-[var(--blue-border)] pt-4">
        <h3 className="de-display text-base tracking-tight">
          Rémunération automatique
        </h3>

        <fieldset className="grid gap-2">
          <legend className="sr-only">Mode de rémunération</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--blue-border)] p-3">
            <input
              type="radio"
              name="revenue_mode_edit"
              className="mt-1"
              checked={form.revenue_mode === "percentage"}
              onChange={() =>
                setForm((prev) => ({ ...prev, revenue_mode: "percentage" }))
              }
            />
            <span>
              <span className="block text-sm font-medium">Pourcentage</span>
              <span className="text-xs de-muted">
                Part du prix client, calculée à chaque réservation.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--blue-border)] p-3">
            <input
              type="radio"
              name="revenue_mode_edit"
              className="mt-1"
              checked={form.revenue_mode === "pro_price"}
              onChange={() =>
                setForm((prev) => ({ ...prev, revenue_mode: "pro_price" }))
              }
            />
            <span>
              <span className="block text-sm font-medium">Prix pro</span>
              <span className="text-xs de-muted">
                Grille prix pro du véhicule (+ km supp.). DreamEffect conserve
                la marge sur le tarif client.
              </span>
            </span>
          </label>
        </fieldset>

        {form.revenue_mode === "percentage" && (
          <div>
            <label
              htmlFor="owner-share-percent-edit"
              className="de-label mb-1 block"
            >
              Part propriétaire (%)
            </label>
            <input
              id="owner-share-percent-edit"
              type="number"
              min={0}
              max={100}
              step={1}
              required
              value={form.owner_revenue_share_percent}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  owner_revenue_share_percent: Number(e.target.value),
                }))
              }
              className="de-input w-full max-w-xs"
            />
          </div>
        )}
      </div>

      <div className="grid gap-3 border-t border-[var(--blue-border)] pt-4 sm:grid-cols-2">
        <div className="de-card-inner">
          <p className="de-label">Date d&apos;inscription</p>
          <p className="mt-1 text-sm font-medium">{formatDate(createdAt)}</p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Rôle</p>
          <p className="mt-1 text-sm font-medium capitalize">{role}</p>
        </div>
      </div>

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="de-btn de-btn-primary"
      >
        {pending ? "Enregistrement…" : "Enregistrer les informations"}
      </button>
    </form>
  );
}
