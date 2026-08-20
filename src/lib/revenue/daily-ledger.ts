import type { SupabaseClient } from "@supabase/supabase-js";
import { toDateKey } from "@/src/lib/dates/calendar-utils";
import {
  computeRevenueSummary,
  resolveReservationSplit,
  splitRevenue,
  type ReservationForRevenue,
} from "@/src/lib/revenue/split";

export type DailyLedgerRow = {
  id: string;
  reservation_id: string;
  vehicle_id: string;
  owner_id: string;
  ledger_date: string;
  daily_total: number;
  owner_amount: number;
  company_amount: number;
};

export type ReservationForDailyLedger = {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price?: number | null;
  customer_name?: string | null;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function countInclusiveRentalDays(startDate: string, endDate: string) {
  const start = startOfDay(new Date(startDate));
  const end = startOfDay(new Date(endDate));
  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(days, 1);
}

export function isDateWithinRental(
  startDate: string,
  endDate: string,
  date: Date
) {
  const day = startOfDay(date).getTime();
  const start = startOfDay(new Date(startDate)).getTime();
  const end = startOfDay(new Date(endDate)).getTime();
  return day >= start && day <= end;
}

export function getDailyRevenueAmounts(totalPrice: number, rentalDays: number) {
  const safeTotal = Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice : 0;
  const days = Math.max(rentalDays, 1);
  const dailyTotal = Math.round((safeTotal / days) * 100) / 100;
  return splitRevenue(dailyTotal);
}

export function canAccrueDailyRevenue(reservation: ReservationForDailyLedger) {
  return reservation.status === "confirmed";
}

export async function accrueReservationDailyRevenue(
  supabase: SupabaseClient,
  reservation: ReservationForDailyLedger,
  ownerId: string,
  date: Date = new Date()
): Promise<{ created: boolean; ownerAmount: number; ledgerDate: string }> {
  const ledgerDate = toDateKey(date);

  if (!canAccrueDailyRevenue(reservation)) {
    return { created: false, ownerAmount: 0, ledgerDate };
  }

  if (!isDateWithinRental(reservation.start_date, reservation.end_date, date)) {
    return { created: false, ownerAmount: 0, ledgerDate };
  }

  const rentalDays = countInclusiveRentalDays(
    reservation.start_date,
    reservation.end_date
  );
  const daily = getDailyRevenueAmounts(
    Number(reservation.total_price ?? 0),
    rentalDays
  );

  if (daily.total <= 0) {
    return { created: false, ownerAmount: 0, ledgerDate };
  }

  const { data: existing } = await supabase
    .from("reservation_daily_ledger")
    .select("id")
    .eq("reservation_id", reservation.id)
    .eq("ledger_date", ledgerDate)
    .maybeSingle();

  if (existing) {
    return { created: false, ownerAmount: daily.ownerAmount, ledgerDate };
  }

  const { error } = await supabase.from("reservation_daily_ledger").insert({
    reservation_id: reservation.id,
    vehicle_id: reservation.vehicle_id,
    owner_id: ownerId,
    ledger_date: ledgerDate,
    daily_total: daily.total,
    owner_amount: daily.ownerAmount,
    company_amount: daily.companyAmount,
  });

  if (error) {
    if (error.message.includes("Could not find the table")) {
      throw new Error(
        "Table reservation_daily_ledger absente — exécutez la migration 20260731210000_reservation_daily_ledger.sql"
      );
    }
    throw new Error(error.message);
  }

  return { created: true, ownerAmount: daily.ownerAmount, ledgerDate };
}

export async function accrueAllConfirmedReservations(
  supabase: SupabaseClient,
  date: Date = new Date()
) {
  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(
      "id, vehicle_id, start_date, end_date, status, total_price, customer_name"
    )
    .eq("status", "confirmed");

  if (error) {
    throw new Error(error.message);
  }

  const vehicleIds = [
    ...new Set((reservations ?? []).map((reservation) => reservation.vehicle_id)),
  ];

  if (vehicleIds.length === 0) {
    return { processed: 0, accrued: 0 };
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("id, brand, model, owner_id")
    .in("id", vehicleIds);

  if (vehiclesError) {
    throw new Error(vehiclesError.message);
  }

  const vehicleMap = new Map(
    (vehicles ?? []).map((vehicle) => [vehicle.id, vehicle])
  );

  let accrued = 0;

  for (const reservation of reservations ?? []) {
    const vehicle = vehicleMap.get(reservation.vehicle_id);
    if (!vehicle) continue;

    const result = await accrueReservationDailyRevenue(
      supabase,
      reservation as ReservationForDailyLedger,
      vehicle.owner_id,
      date
    );

    if (result.created) {
      accrued += 1;

      const { notifySystemEvent } = await import(
        "@/src/lib/notifications/service"
      );
      await notifySystemEvent(supabase, {
        ownerId: vehicle.owner_id,
        type: "daily_revenue",
        title: "Revenu journalier enregistré",
        message: `${vehicle.brand} ${vehicle.model} — +${result.ownerAmount.toLocaleString("fr-FR")} € (votre part du ${new Date(result.ledgerDate).toLocaleDateString("fr-FR")})`,
        related_id: reservation.id,
        priority: "normal",
      });
    }
  }

  return { processed: reservations?.length ?? 0, accrued };
}

export type LedgerAggregate = {
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
  entryCount: number;
};

export function aggregateLedgerRows(
  rows: Pick<DailyLedgerRow, "daily_total" | "owner_amount" | "company_amount">[]
): LedgerAggregate {
  return rows.reduce(
    (acc, row) => ({
      totalRevenue: acc.totalRevenue + Number(row.daily_total ?? 0),
      ownerShare: acc.ownerShare + Number(row.owner_amount ?? 0),
      companyShare: acc.companyShare + Number(row.company_amount ?? 0),
      entryCount: acc.entryCount + 1,
    }),
    { totalRevenue: 0, ownerShare: 0, companyShare: 0, entryCount: 0 }
  );
}

export async function fetchLedgerForReservations(
  supabase: SupabaseClient,
  reservationIds: string[]
) {
  if (reservationIds.length === 0) {
    return new Map<string, LedgerAggregate>();
  }

  const { data, error } = await supabase
    .from("reservation_daily_ledger")
    .select("reservation_id, daily_total, owner_amount, company_amount")
    .in("reservation_id", reservationIds);

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return new Map<string, LedgerAggregate>();
    }
    throw new Error(error.message);
  }

  const grouped = new Map<string, Pick<DailyLedgerRow, "daily_total" | "owner_amount" | "company_amount">[]>();

  for (const row of data ?? []) {
    const list = grouped.get(row.reservation_id) ?? [];
    list.push(row);
    grouped.set(row.reservation_id, list);
  }

  const aggregates = new Map<string, LedgerAggregate>();
  for (const [reservationId, rows] of grouped.entries()) {
    aggregates.set(reservationId, aggregateLedgerRows(rows));
  }

  return aggregates;
}

export function computeRevenueSummaryWithLedger(
  reservations: (ReservationForRevenue & { id?: string })[],
  ledgerByReservation: Map<string, LedgerAggregate>
) {
  let totalRevenue = 0;
  let ownerShare = 0;
  let companyShare = 0;
  let rentalCount = 0;

  for (const reservation of reservations) {
    if (reservation.status === "cancelled") continue;

    const reservationId = reservation.id;
    const ledger = reservationId
      ? ledgerByReservation.get(reservationId)
      : undefined;

    // Réservation terminée : toujours le total contractuel (montants stockés)
    if (reservation.status === "finished") {
      const split = resolveReservationSplit(reservation);
      totalRevenue += split.total;
      ownerShare += split.ownerAmount;
      companyShare += split.companyAmount;
      rentalCount += 1;
      continue;
    }

    // En cours : journal quotidien si disponible, sinon ignorer
    if (ledger && ledger.entryCount > 0) {
      totalRevenue += ledger.totalRevenue;
      ownerShare += ledger.ownerShare;
      companyShare += ledger.companyShare;
      rentalCount += 1;
    }
  }

  return { totalRevenue, ownerShare, companyShare, rentalCount };
}

export async function fetchOwnerLedgerSummary(
  supabase: SupabaseClient,
  ownerId: string,
  options?: { fromDate?: string; toDate?: string }
) {
  let query = supabase
    .from("reservation_daily_ledger")
    .select("daily_total, owner_amount, company_amount")
    .eq("owner_id", ownerId);

  if (options?.fromDate) {
    query = query.gte("ledger_date", options.fromDate);
  }

  if (options?.toDate) {
    query = query.lte("ledger_date", options.toDate);
  }

  const { data, error } = await query;

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return aggregateLedgerRows([]);
    }
    throw new Error(error.message);
  }

  return aggregateLedgerRows(data ?? []);
}

/** Fallback historique si pas de journal (réservations terminées uniquement). */
export { computeRevenueSummary, resolveReservationSplit };
