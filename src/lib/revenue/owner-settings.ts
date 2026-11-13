import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumnError } from "@/src/lib/vehicles/db-columns";
import {
  normalizeVehicleProPricing,
  type VehicleProPricing,
} from "@/src/lib/revenue/pro-pricing";
import {
  isRevenueMode,
  normalizeMonthlyRent,
  normalizeOwnerShare,
  type RevenueMode,
  type RevenueSplitContext,
} from "@/src/lib/revenue/split";

export type OwnerRevenueSettings = {
  mode: RevenueMode;
  ownerShare: number;
};

const DEFAULT_SETTINGS: OwnerRevenueSettings = {
  mode: "percentage",
  ownerShare: 0.6,
};

function parseMode(value: unknown): RevenueMode {
  return isRevenueMode(value) ? value : "percentage";
}

export function parseOwnerRevenueSettings(row: {
  revenue_mode?: string | null;
  owner_revenue_share?: number | null;
} | null): OwnerRevenueSettings {
  if (!row) return DEFAULT_SETTINGS;
  return {
    mode: parseMode(row.revenue_mode),
    ownerShare: normalizeOwnerShare(row.owner_revenue_share),
  };
}

export async function fetchOwnerRevenueSettings(
  supabase: SupabaseClient,
  ownerId: string
): Promise<OwnerRevenueSettings> {
  const { data, error } = await supabase
    .from("profiles")
    .select("revenue_mode, owner_revenue_share")
    .eq("id", ownerId)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error.message)) {
      return DEFAULT_SETTINGS;
    }
    console.error("[fetchOwnerRevenueSettings]", error.message);
    return DEFAULT_SETTINGS;
  }

  return parseOwnerRevenueSettings(data);
}

export async function fetchVehicleProPricing(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<VehicleProPricing> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "pro_price_24h_weekday, pro_price_24h_weekend, pro_price_48h_weekend, pro_price_72h_weekend, pro_price_7_days, pro_included_km, pro_extra_km_rate"
    )
    .eq("id", vehicleId)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error.message)) {
      return normalizeVehicleProPricing(null);
    }
    console.error("[fetchVehicleProPricing]", error.message);
    return normalizeVehicleProPricing(null);
  }

  return normalizeVehicleProPricing(data);
}

export async function fetchVehicleMonthlyRent(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("monthly_rent")
    .eq("id", vehicleId)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error.message)) {
      return null;
    }
    console.error("[fetchVehicleMonthlyRent]", error.message);
    return null;
  }

  return normalizeMonthlyRent(
    data?.monthly_rent != null ? Number(data.monthly_rent) : null
  );
}

export async function fetchVehiclesMonthlyRentMap(
  supabase: SupabaseClient,
  vehicleIds: string[]
): Promise<Map<string, number | null>> {
  const map = new Map<string, number | null>();
  if (vehicleIds.length === 0) return map;

  const { data, error } = await supabase
    .from("vehicles")
    .select("id, monthly_rent")
    .in("id", vehicleIds);

  if (error) {
    if (!isMissingColumnError(error.message)) {
      console.error("[fetchVehiclesMonthlyRentMap]", error.message);
    }
    return map;
  }

  for (const row of data ?? []) {
    map.set(
      row.id,
      normalizeMonthlyRent(
        row.monthly_rent != null ? Number(row.monthly_rent) : null
      )
    );
  }

  return map;
}

export async function buildRevenueSplitContextForVehicle(
  supabase: SupabaseClient,
  vehicleId: string,
  options: {
    startDate?: string | null;
    endDate?: string | null;
    distanceKm?: number | null;
  } = {}
): Promise<RevenueSplitContext> {
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select(
      "owner_id, monthly_rent, pro_price_24h_weekday, pro_price_24h_weekend, pro_price_48h_weekend, pro_price_72h_weekend, pro_price_7_days, pro_included_km, pro_extra_km_rate"
    )
    .eq("id", vehicleId)
    .maybeSingle();

  if (vehicleError || !vehicle) {
    if (vehicleError && isMissingColumnError(vehicleError.message)) {
      const legacy = await supabase
        .from("vehicles")
        .select(
          "owner_id, pro_price_24h_weekday, pro_price_24h_weekend, pro_price_48h_weekend, pro_price_72h_weekend, pro_price_7_days, pro_included_km, pro_extra_km_rate"
        )
        .eq("id", vehicleId)
        .maybeSingle();

      if (legacy.data) {
        const settings = await fetchOwnerRevenueSettings(
          supabase,
          legacy.data.owner_id
        );
        return {
          mode: settings.mode,
          ownerShare: settings.ownerShare,
          startDate: options.startDate,
          endDate: options.endDate,
          distanceKm: options.distanceKm,
          proPricing: normalizeVehicleProPricing(legacy.data),
          monthlyRent: null,
        };
      }
    } else if (vehicleError && !isMissingColumnError(vehicleError.message)) {
      console.error("[buildRevenueSplitContextForVehicle]", vehicleError.message);
    }
    return {
      mode: "percentage",
      ownerShare: 0.6,
      startDate: options.startDate,
      endDate: options.endDate,
      distanceKm: options.distanceKm,
      proPricing: null,
      monthlyRent: null,
    };
  }

  const settings = await fetchOwnerRevenueSettings(supabase, vehicle.owner_id);

  return {
    mode: settings.mode,
    ownerShare: settings.ownerShare,
    startDate: options.startDate,
    endDate: options.endDate,
    distanceKm: options.distanceKm,
    proPricing: normalizeVehicleProPricing(vehicle),
    monthlyRent: normalizeMonthlyRent(
      vehicle.monthly_rent != null ? Number(vehicle.monthly_rent) : null
    ),
  };
}

export type VehicleRevenueFormConfig = {
  vehicleId: string;
  mode: RevenueMode;
  ownerSharePercent: number;
  proPricing: VehicleProPricing;
  monthlyRent: number | null;
};

export async function fetchVehiclesRevenueFormConfigs(
  supabase: SupabaseClient
): Promise<VehicleRevenueFormConfig[]> {
  const withRent = await supabase
    .from("vehicles")
    .select(
      "id, owner_id, monthly_rent, pro_price_24h_weekday, pro_price_24h_weekend, pro_price_48h_weekend, pro_price_72h_weekend, pro_price_7_days, pro_included_km, pro_extra_km_rate"
    );

  const vehiclesResult =
    withRent.error && isMissingColumnError(withRent.error.message)
      ? await supabase
          .from("vehicles")
          .select(
            "id, owner_id, pro_price_24h_weekday, pro_price_24h_weekend, pro_price_48h_weekend, pro_price_72h_weekend, pro_price_7_days, pro_included_km, pro_extra_km_rate"
          )
      : withRent;

  if (vehiclesResult.error) {
    if (!isMissingColumnError(vehiclesResult.error.message)) {
      console.error(
        "[fetchVehiclesRevenueFormConfigs]",
        vehiclesResult.error.message
      );
    }
    return [];
  }

  const vehicles = vehiclesResult.data ?? [];
  const ownerIds = [
    ...new Set(vehicles.map((vehicle) => vehicle.owner_id).filter(Boolean)),
  ];

  const settingsByOwner = new Map<string, OwnerRevenueSettings>();

  if (ownerIds.length > 0) {
    const { data: owners, error: ownersError } = await supabase
      .from("profiles")
      .select("id, revenue_mode, owner_revenue_share")
      .in("id", ownerIds);

    if (ownersError) {
      if (!isMissingColumnError(ownersError.message)) {
        console.error("[fetchVehiclesRevenueFormConfigs:owners]", ownersError.message);
      }
    } else {
      for (const owner of owners ?? []) {
        settingsByOwner.set(owner.id, parseOwnerRevenueSettings(owner));
      }
    }
  }

  return vehicles.map((vehicle) => {
    const settings =
      settingsByOwner.get(vehicle.owner_id) ?? DEFAULT_SETTINGS;
    const monthlyRent =
      "monthly_rent" in vehicle
        ? normalizeMonthlyRent(
            vehicle.monthly_rent != null ? Number(vehicle.monthly_rent) : null
          )
        : null;

    return {
      vehicleId: vehicle.id,
      mode: settings.mode,
      ownerSharePercent: Math.round(settings.ownerShare * 100),
      proPricing: normalizeVehicleProPricing(vehicle),
      monthlyRent,
    };
  });
}
