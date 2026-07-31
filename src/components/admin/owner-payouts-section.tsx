"use client";

import { useState, useTransition } from "react";
import {
  createOwnerPayout,
  markPayoutAsPaid,
  deleteOwnerPayout,
} from "@/src/lib/admin/finance-actions";
import type { OwnerPayoutRecord } from "@/src/lib/admin/finance-types";

function formatEuro(amount?: number | null) {
  return `${Number(amount ?? 0).toLocaleString("fr-FR")} €`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function PayoutStatusBadge({ status }: { status: "pending" | "paid" }) {
  if (status === "paid") {
    return (
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
        Payé
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
      En attente
    </span>
  );
}

export default function OwnerPayoutsSection({
  payouts,
  owners,
}: {
  payouts: OwnerPayoutRecord[];
  owners: { id: string; label: string }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    owner_id: "",
    amount_due: 0,
    amount_paid: 0,
    period_start: "",
    period_end: "",
    status: "pending" as "pending" | "paid",
    notes: "",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createOwnerPayout(form);
      if (!result.success) {
        setError(result.error ?? "Erreur inconnue");
        return;
      }
      setShowForm(false);
      setForm({
        owner_id: "",
        amount_due: 0,
        amount_paid: 0,
        period_start: "",
        period_end: "",
        status: "pending",
        notes: "",
      });
    });
  }

  function handleMarkPaid(id: string) {
    startTransition(async () => {
      await markPayoutAsPaid(id);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer ce reversement ?")) return;
    startTransition(async () => {
      await deleteOwnerPayout(id);
    });
  }

  const pendingTotal = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount_due - p.amount_paid), 0);

  const paidTotal = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_paid, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="de-card-inner">
          <p className="de-label">Reversements en attente</p>
          <p className="de-stat-value mt-1 text-lg text-amber-400">
            {payouts.filter((p) => p.status === "pending").length}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Montant en attente</p>
          <p className="de-stat-value mt-1 text-lg text-amber-400">
            {formatEuro(pendingTotal)}
          </p>
        </div>
        <div className="de-card-inner">
          <p className="de-label">Total reversé</p>
          <p className="de-stat-value mt-1 text-lg text-emerald-400">
            {formatEuro(paidTotal)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm de-muted">
          Suivi interne des reversements propriétaires
        </p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="de-btn de-btn-primary text-sm"
        >
          {showForm ? "Annuler" : "Nouveau reversement"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="de-card-inner space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs de-muted">Propriétaire</span>
              <select
                required
                value={form.owner_id}
                onChange={(e) =>
                  setForm({ ...form, owner_id: e.target.value })
                }
                className="de-input w-full text-sm"
              >
                <option value="">Sélectionner</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs de-muted">Statut</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "pending" | "paid",
                  })
                }
                className="de-input w-full text-sm"
              >
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs de-muted">Montant dû (€)</span>
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={form.amount_due || ""}
                onChange={(e) =>
                  setForm({ ...form, amount_due: Number(e.target.value) })
                }
                className="de-input w-full text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs de-muted">Montant reversé (€)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.amount_paid || ""}
                onChange={(e) =>
                  setForm({ ...form, amount_paid: Number(e.target.value) })
                }
                className="de-input w-full text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs de-muted">Début période</span>
              <input
                type="date"
                required
                value={form.period_start}
                onChange={(e) =>
                  setForm({ ...form, period_start: e.target.value })
                }
                className="de-input w-full text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs de-muted">Fin période</span>
              <input
                type="date"
                required
                value={form.period_end}
                onChange={(e) =>
                  setForm({ ...form, period_end: e.target.value })
                }
                className="de-input w-full text-sm"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs de-muted">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="de-input w-full text-sm"
              placeholder="Référence virement, commentaire..."
            />
          </label>

          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="de-btn de-btn-primary text-sm"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}

      {payouts.length === 0 ? (
        <p className="de-empty">
          Aucun reversement enregistré. Créez un reversement pour commencer le
          suivi.
        </p>
      ) : (
        <div className="de-list">
          {payouts.map((payout) => (
            <div key={payout.id} className="de-list-item">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{payout.owner_name}</p>
                    <PayoutStatusBadge status={payout.status} />
                  </div>
                  <p className="text-xs de-muted">
                    Période : {formatDate(payout.period_start)} —{" "}
                    {formatDate(payout.period_end)}
                  </p>
                  {payout.notes && (
                    <p className="text-xs de-muted">{payout.notes}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--blue-soft)]">
                    {formatEuro(payout.amount_due)}
                  </p>
                  <p className="text-xs de-muted">
                    Reversé : {formatEuro(payout.amount_paid)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {payout.status === "pending" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleMarkPaid(payout.id)}
                    className="de-btn de-btn-ghost text-xs"
                  >
                    Marquer payé
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(payout.id)}
                  className="de-btn text-xs text-[var(--destructive)]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
