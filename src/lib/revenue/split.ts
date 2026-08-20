/** Répartition automatique des revenus de location DreamEffect. */

export const OWNER_REVENUE_SHARE = 0.6;
export const COMPANY_REVENUE_SHARE = 0.4;

export const OWNER_REVENUE_SHARE_PERCENT = Math.round(OWNER_REVENUE_SHARE * 100);
export const COMPANY_REVENUE_SHARE_PERCENT = Math.round(
  COMPANY_REVENUE_SHARE * 100
);

export type RevenueSplit = {
  total: number;
  ownerAmount: number;
  companyAmount: number;
};

export function splitRevenue(total: number): RevenueSplit {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const ownerAmount =
    Math.round(safeTotal * OWNER_REVENUE_SHARE * 100) / 100;
  const companyAmount =
    Math.round((safeTotal - ownerAmount) * 100) / 100;

  return {
    total: safeTotal,
    ownerAmount,
    companyAmount,
  };
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

  // Préférer les montants persistés (historique stable si le % change)
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
