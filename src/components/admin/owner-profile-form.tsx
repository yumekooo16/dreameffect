"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOwnerProfile } from "@/src/lib/admin/owners-actions";

type Props = {
  ownerId: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt?: string | null;
  role: string;
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
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: firstName,
    last_name: lastName,
    phone,
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
        Complétez ou mettez à jour les informations du propriétaire.
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
