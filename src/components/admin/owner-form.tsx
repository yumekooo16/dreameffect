"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOwnerAccount } from "@/src/lib/admin/owners-actions";
import type { OwnerFormData } from "@/src/lib/admin/owners-types";
import type { RevenueMode } from "@/src/lib/revenue/split";

const defaultForm: OwnerFormData = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  revenue_mode: "percentage",
  owner_revenue_share_percent: 60,
};

export default function OwnerForm({ cancelHref }: { cancelHref: string }) {
  const router = useRouter();
  const [form, setForm] = useState<OwnerFormData>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateField<K extends keyof OwnerFormData>(
    key: K,
    value: OwnerFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createOwnerAccount(form);

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue");
        return;
      }

      setSuccess(
        "Invitation envoyée sur l'email du propriétaire. Il devra cliquer le lien pour vérifier son adresse et choisir son mot de passe."
      );
      router.push(`/admin/proprietaires/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm de-muted">
        Saisissez le <strong>vrai email</strong> du propriétaire. Une invitation
        de vérification lui est envoyée : il confirme son adresse et crée son
        mot de passe. Vous pourrez ensuite le joindre par mail en cas de besoin.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="owner-email" className="de-label mb-1 block">
            Email réel du propriétaire
          </label>
          <input
            id="owner-email"
            type="email"
            required
            autoComplete="off"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Ex. jean.dupont@gmail.com"
            className="de-input w-full"
          />
          <p className="mt-1 text-xs de-muted">
            Pas d&apos;email inventé (@test, @example…). L&apos;invitation part
            sur cette boîte.
          </p>
        </div>

        <div>
          <label htmlFor="owner-first-name" className="de-label mb-1 block">
            Prénom
          </label>
          <input
            id="owner-first-name"
            type="text"
            value={form.first_name}
            onChange={(e) => updateField("first_name", e.target.value)}
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
            onChange={(e) => updateField("last_name", e.target.value)}
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
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Ex. 06 12 34 56 78"
            className="de-input w-full"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-[var(--blue-border)] pt-5">
        <h3 className="de-display text-base tracking-tight">
          Rémunération automatique
        </h3>
        <p className="text-sm de-muted">
          Pourcentage du CA client, ou grille de prix pro sur chaque véhicule
          (saisie dans la fiche véhicule).
        </p>

        <fieldset className="grid gap-2">
          <legend className="sr-only">Mode de rémunération</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--blue-border)] p-3">
            <input
              type="radio"
              name="revenue_mode"
              className="mt-1"
              checked={form.revenue_mode === "percentage"}
              onChange={() =>
                updateField("revenue_mode", "percentage" as RevenueMode)
              }
            />
            <span>
              <span className="block text-sm font-medium">Pourcentage</span>
              <span className="text-xs de-muted">
                Part propriétaire calculée automatiquement sur le prix de
                location client.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--blue-border)] p-3">
            <input
              type="radio"
              name="revenue_mode"
              className="mt-1"
              checked={form.revenue_mode === "pro_price"}
              onChange={() =>
                updateField("revenue_mode", "pro_price" as RevenueMode)
              }
            />
            <span>
              <span className="block text-sm font-medium">Prix pro</span>
              <span className="text-xs de-muted">
                Gain calculé via la grille prix pro du véhicule (+ km
                supplémentaires).
              </span>
            </span>
          </label>
        </fieldset>

        {form.revenue_mode === "percentage" && (
          <div>
            <label
              htmlFor="owner-share-percent"
              className="de-label mb-1 block"
            >
              Part propriétaire (%)
            </label>
            <input
              id="owner-share-percent"
              type="number"
              min={0}
              max={100}
              step={1}
              required
              value={form.owner_revenue_share_percent}
              onChange={(e) =>
                updateField(
                  "owner_revenue_share_percent",
                  Number(e.target.value)
                )
              }
              className="de-input w-full max-w-xs"
            />
            <p className="mt-1 text-xs de-muted">
              DreamEffect conserve automatiquement le reste (
              {Math.max(0, 100 - Number(form.owner_revenue_share_percent || 0))}
              %).
            </p>
          </div>
        )}

        {form.revenue_mode === "pro_price" && (
          <p className="text-sm de-muted">
            Renseignez ensuite la grille prix pro sur chaque véhicule de ce
            propriétaire (ex. 24 h semaine, week-end, km inclus).
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-[var(--blue-soft)]">{success}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="de-btn de-btn-primary"
        >
          {pending ? "Envoi de l'invitation…" : "Inviter le propriétaire"}
        </button>
        <a href={cancelHref} className="de-btn de-btn-ghost">
          Annuler
        </a>
      </div>
    </form>
  );
}
