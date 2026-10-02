/** Recalcule la répartition d'une réservation selon le mode actuel (prix pro / %). */

import {
  splitRevenueForContext,
  type RevenueMode,
  type RevenueSplit,
} from "@/src/lib/revenue/split";
import type { VehicleProPricing } from "@/src/lib/revenue/pro-pricing";

export type LiveRevenueConfig = {
  mode: RevenueMode;
  ownerSharePercent: number;
  proPricing: VehicleProPricing;
};

export type ReservationRevenueInput = {
  vehicle_id: string;
  total_price?: number | null;
  owner_amount?: number | null;
  company_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  distance_km?: number | null;
};

export type LiveReservationSplit = RevenueSplit & {
  mode: RevenueMode;
  tierLabel?: string | null;
  /** true si les montants stockés ne correspondent plus au calcul live */
  needsSync: boolean;
};

export function computeLiveReservationSplit(
  reservation: ReservationRevenueInput,
  config?: LiveRevenueConfig | null
): LiveReservationSplit {
  const total = Number(reservation.total_price ?? 0);
  const storedOwner = Number(reservation.owner_amount ?? 0);
  const storedCompany = Number(reservation.company_amount ?? 0);

  if (!config) {
    return {
      total: Number.isFinite(total) && total > 0 ? total : 0,
      ownerAmount: storedOwner,
      companyAmount: storedCompany,
      mode: "percentage",
      tierLabel: null,
      needsSync: false,
    };
  }

  const split = splitRevenueForContext(total, {
    mode: config.mode,
    ownerShare: config.ownerSharePercent / 100,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    distanceKm: reservation.distance_km,
    proPricing: config.proPricing,
  });

  // En prix pro, n'écraser que si le calcul grille est abouti (tierLabel présent).
  if (config.mode === "pro_price" && !split.tierLabel) {
    return {
      total: split.total,
      ownerAmount: storedOwner,
      companyAmount: storedCompany,
      mode: "pro_price",
      tierLabel: null,
      needsSync: false,
    };
  }

  const needsSync =
    Math.round(storedOwner * 100) !== Math.round(split.ownerAmount * 100) ||
    Math.round(storedCompany * 100) !== Math.round(split.companyAmount * 100);

  return { ...split, needsSync };
}
