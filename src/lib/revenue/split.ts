/** Répartition automatique des revenus de location DreamEffect. */

import {
  computeProOwnerPayout,
  hasAnyProPrice,
  type VehicleProPricing,
} from "@/src/lib/revenue/pro-pricing";

export const OWNER_REVENUE_SHARE = 0.6;
export const COMPANY_REVENUE_SHARE = 0.4;

export const OWNER_REVENUE_SHARE_PERCENT = Math.round(OWNER_REVENUE_SHARE * 100);
export const COMPANY_REVENUE_SHARE_PERCENT = Math.round(
  COMPANY_REVENUE_SHARE * 100
);

export type RevenueMode = "percentage" | "pro_price";

export type RevenueSplit = {
  total: number;
  ownerAmount: number;
  companyAmount: number;
};

export type RevenueSplitContext = {
  mode: RevenueMode;
  /** Part propriétaire 0–1 (mode percentage). Défaut 0.6. */
  ownerShare?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  distanceKm?: number | null;
  proPricing?: VehicleProPricing | null;
};

export function normalizeOwnerShare(share?: number | null) {
  if (share == null || !Number.isFinite(share)) return OWNER_REVENUE_SHARE;
  if (share < 0) return 0;
  if (share > 1) return 1;
  return share;
}

export function splitRevenue(
  total: number,
  ownerShare: number = OWNER_REVENUE_SHARE
): RevenueSplit {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const share = normalizeOwnerShare(ownerShare);
  const ownerAmount = Math.round(safeTotal * share * 100) / 100;
  const companyAmount = Math.round((safeTotal - ownerAmount) * 100) / 100;

  return {
    total: safeTotal,
    ownerAmount,
    companyAmount,
  };
}

/**
 * Calcule la répartition selon le mode propriétaire.
 * - percentage : % du prix client
 * - pro_price : grille prix pro véhicule (+ km supp.) ; DreamEffect = reste du CA
 */
export function splitRevenueForContext(
  total: number,
  context?: RevenueSplitContext | null
): RevenueSplit & { mode: RevenueMode; tierLabel?: string | null } {
  const mode = context?.mode ?? "percentage";
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;

  if (
    mode === "pro_price" &&
    context?.proPricing &&
    hasAnyProPrice(context.proPricing) &&
    context.startDate &&
    context.endDate
  ) {
    const payout = computeProOwnerPayout(
      context.proPricing,
      context.startDate,
      context.endDate,
      context.distanceKm
    );

    if (payout) {
      const ownerAmount = payout.ownerAmount;
      const companyAmount =
        Math.round((safeTotal - ownerAmount) * 100) / 100;

      return {
        total: safeTotal,
        ownerAmount,
        companyAmount,
        mode: "pro_price",
        tierLabel: payout.tierLabel,
      };
    }
  }

  const percentageSplit = splitRevenue(
    safeTotal,
    context?.ownerShare ?? undefined
  );
  return { ...percentageSplit, mode: "percentage", tierLabel: null };
}

export function resolveReservationSplit(reservation: {
  total_price?: number | null;
  owner_amount?: number | null;
  company_amount?: number | null;
}): RevenueSplit {
  const total = Number(reservation.total_price ?? 0);
  if (total <= 0) {
    return { total: 0, ownerAmount: 0, companyAmount: 0 };
  }

  const storedOwner = reservation.owner_amount;
  const storedCompany = reservation.company_amount;

  // Préférer les montants persistés (historique stable si le % / mode change)
  if (
    storedOwner != null &&
    storedCompany != null &&
    Number.isFinite(Number(storedOwner)) &&
    Number.isFinite(Number(storedCompany))
  ) {
    return {
      total,
      ownerAmount: Math.round(Number(storedOwner) * 100) / 100,
      companyAmount: Math.round(Number(storedCompany) * 100) / 100,
    };
  }

  return splitRevenue(total);
}

export type ReservationForRevenue = {
  status: string;
  total_price?: number | null;
  owner_amount?: number | null;
  company_amount?: number | null;
  start_date?: string;
  end_date?: string;
};

export function computeRevenueSummary(
  reservations: ReservationForRevenue[],
  options?: { finishedOnly?: boolean }
) {
  const finishedOnly = options?.finishedOnly ?? true;
  const relevant = finishedOnly
    ? reservations.filter((reservation) => reservation.status === "finished")
    : reservations.filter((reservation) => reservation.status !== "cancelled");

  let totalRevenue = 0;
  let ownerShare = 0;
  let companyShare = 0;

  for (const reservation of relevant) {
    const split = resolveReservationSplit(reservation);
    totalRevenue += split.total;
    ownerShare += split.ownerAmount;
    companyShare += split.companyAmount;
  }

  return {
    totalRevenue,
    ownerShare,
    companyShare,
    rentalCount: relevant.length,
  };
}

export function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

export function revenueModeLabel(mode: RevenueMode) {
  return mode === "pro_price" ? "Prix pro" : "Pourcentage";
}
