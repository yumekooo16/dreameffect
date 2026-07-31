"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOwnerAccount } from "@/src/lib/admin/owners-actions";
import type { OwnerFormData } from "@/src/lib/admin/owners-types";

const defaultForm: OwnerFormData = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
};

export default function OwnerForm({ cancelHref }: { cancelHref: string }) {
  const router = useRouter();
  const [form, setForm] = useState<OwnerFormData>(defaultForm);
  const [error, setError] = useState<string | null>(null);
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

    startTransition(async () => {
      const result = await createOwnerAccount(form);

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue");
        return;
      }

      router.push(`/admin/proprietaires/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm de-muted">
        Créez un accès à l&apos;espace propriétaire. Le propriétaire pourra se
        connecter avec l&apos;email et le mot de passe définis ci-dessous.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="owner-email" className="de-label mb-1 block">
            Email de connexion
          </label>
          <input
            id="owner-email"
            type="email"
            required
            autoComplete="off"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Ex. jean.dupont@email.com"
            className="de-input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="owner-password" className="de-label mb-1 block">
            Mot de passe
          </label>
          <input
            id="owner-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="8 caractères minimum"
            className="de-input w-full"
          />
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="de-btn de-btn-primary"
        >
          {pending ? "Création…" : "Créer le compte propriétaire"}
        </button>
        <a href={cancelHref} className="de-btn de-btn-ghost">
          Annuler
        </a>
      </div>
    </form>
  );
}
