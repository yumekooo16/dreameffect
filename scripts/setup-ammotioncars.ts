/**
 * Crée le propriétaire AM Motion Cars + BMW Série 2 Gran Coupe
 * avec la grille tarifaire et la projection de rentabilité du PDF.
 *
 * Usage : npx tsx scripts/setup-ammotioncars.ts
 */

import dotenv from "dotenv";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { buildVehicleSlug } from "@/src/lib/public/vehicle-slug";
import { deriveDailyRate } from "@/src/lib/vehicles/pricing";
import { splitRevenueForContext } from "@/src/lib/revenue/split";
import { normalizeVehicleProPricing } from "@/src/lib/revenue/pro-pricing";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const OWNER_EMAIL = "contact@ammotioncars.com";
/** Email legacy (seed / migration) */
const OWNER_EMAIL_LEGACY = "ammotioncars@dreameffect.fr";
const OWNER_PASSWORD = "AmmotionCars2026!";

/** Exercice PDF « Rentabilité série 2 » — projection calendaire 2025 (2025/2026) */
const PROJECTION_YEAR = 2025;
const PROJECTION_LABEL = "2025/2026";

/** Projection optimiste 12 mois — PDF « Rentabilité série 2 » */
const MONTHLY_PROJECTION = [
  { month: 1, daysRented: 10, revenue: 1250 },
  { month: 2, daysRented: 12, revenue: 1500 },
  { month: 3, daysRented: 16, revenue: 2000 },
  { month: 4, daysRented: 18, revenue: 2250 },
  { month: 5, daysRented: 21, revenue: 2625 },
  { month: 6, daysRented: 24, revenue: 3000 },
  { month: 7, daysRented: 27, revenue: 3375 },
  { month: 8, daysRented: 29, revenue: 3625 },
  { month: 9, daysRented: 23, revenue: 2875 },
  { month: 10, daysRented: 19, revenue: 2375 },
  { month: 11, daysRented: 15, revenue: 1875 },
  { month: 12, daysRented: 18, revenue: 2250 },
] as const;

const PRO_PRICING = normalizeVehicleProPricing({
  pro_price_24h_weekday: 70,
  pro_price_24h_weekend: 120,
  pro_price_48h_weekend: 200,
  pro_price_72h_weekend: 300,
  pro_price_7_days: 500,
  pro_included_km: 200,
  pro_extra_km_rate: 1,
});

const VEHICLE = {
  brand: "BMW",
  model: "Serie 2",
  version: "Gran Coupe",
  year: 2021,
  color: "Gris",
  mileage: 18500,
  status: "available",
  plate: null as string | null,
  fuel: "essence",
  transmission: "automatique",
  power: 136,
  location: "Beauvais",
  description:
    "BMW Série 2 Gran Coupé — berline sportive compacte, idéale pour la location premium.",
  slug: "bmw-serie-2-gran-coupe",
  pricing: {
    price_24h_weekday: 120,
    price_24h_weekend: 250,
    price_48h_weekend: 350,
    price_72h_weekend: 420,
    price_7_days: 650,
    deposit: 2000,
  },
  proPricing: PRO_PRICING,
};

/** Part propriétaire via grille prix pro (mode AM Motion). */
function splitAmount(
  total: number,
  start: string,
  end: string,
  distanceKm: number
) {
  const { ownerAmount, companyAmount } = splitRevenueForContext(total, {
    mode: "pro_price",
    startDate: start,
    endDate: end,
    distanceKm,
    proPricing: PRO_PRICING,
  });
  return { ownerAmount, companyAmount };
}

function monthDateRange(year: number, month: number, daysRented: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 10, 0, 0));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + Math.max(daysRented - 1, 0));
  end.setUTCHours(18, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function ensureOwner(supabase: ReturnType<typeof createAdminClient>) {
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let user = listData.users.find(
    (u) => u.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()
  );

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: "AM Motion",
        last_name: "Cars",
      },
    });

    if (error || !data.user) {
      throw new Error(`Création propriétaire : ${error?.message ?? "échec"}`);
    }

    user = data.user;
    console.log("✓ Propriétaire créé :", OWNER_EMAIL);
  } else {
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: OWNER_PASSWORD, email_confirm: true }
    );

    if (passwordError) {
      throw new Error(`Mise à jour mot de passe : ${passwordError.message}`);
    }

    console.log("✓ Propriétaire existant (mot de passe synchronisé) :", OWNER_EMAIL);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      first_name: "AM Motion",
      last_name: "Cars",
      role: "owner",
      phone: "+33 6 16 32 03 81",
      revenue_mode: "pro_price",
      owner_revenue_share: null,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    if (profileError.message.includes("does not exist")) {
      const { error: fallbackError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          first_name: "AM Motion",
          last_name: "Cars",
          role: "owner",
          phone: "+33 6 16 32 03 81",
        },
        { onConflict: "id" }
      );
      if (fallbackError) {
        throw new Error(`Profil propriétaire : ${fallbackError.message}`);
      }
      console.warn(
        "⚠ Colonnes revenue_mode absentes — exécutez la migration 20260824120000_owner_revenue_modes.sql"
      );
    } else {
      throw new Error(`Profil propriétaire : ${profileError.message}`);
    }
  }

  return user.id;
}

async function ensureVehicle(
  supabase: ReturnType<typeof createAdminClient>,
  ownerId: string
) {
  const { data: existing } = await supabase
    .from("vehicles")
    .select("id, slug")
    .eq("owner_id", ownerId)
    .eq("brand", VEHICLE.brand)
    .eq("model", VEHICLE.model)
    .eq("version", VEHICLE.version)
    .maybeSingle();

  const slug = VEHICLE.slug || buildVehicleSlug(VEHICLE.brand, VEHICLE.model, VEHICLE.version);
  const base = {
    owner_id: ownerId,
    brand: VEHICLE.brand,
    model: VEHICLE.model,
    version: VEHICLE.version,
    year: VEHICLE.year,
    color: VEHICLE.color,
    mileage: VEHICLE.mileage,
    status: VEHICLE.status,
    plate: VEHICLE.plate,
    slug,
    ...VEHICLE.pricing,
    ...VEHICLE.proPricing,
    daily_rate: deriveDailyRate(VEHICLE.pricing),
    fuel: VEHICLE.fuel,
    transmission: VEHICLE.transmission,
    power: VEHICLE.power,
    location: VEHICLE.location,
    description: VEHICLE.description,
    is_published: true,
  };

  if (existing) {
    const { error } = await supabase.from("vehicles").update(base).eq("id", existing.id);
    if (error) throw new Error(`Mise à jour véhicule : ${error.message}`);
    console.log("✓ Véhicule mis à jour : BMW Serie 2 Gran Coupe");
    return existing.id;
  }

  const { data, error } = await supabase.from("vehicles").insert(base).select("id").single();
  if (error || !data) {
    throw new Error(`Insert véhicule : ${error?.message ?? "échec"}`);
  }

  console.log("✓ Véhicule créé : BMW Serie 2 Gran Coupe");
  return data.id;
}

async function seedReservations(
  supabase: ReturnType<typeof createAdminClient>,
  vehicleId: string
) {
  const { data: existingRows } = await supabase
    .from("reservations")
    .select("id, start_date, customer_name")
    .eq("vehicle_id", vehicleId)
    .like("customer_name", "Client projection %");

  const wrongYearIds =
    existingRows
      ?.filter((row) => {
        const year = row.start_date?.slice(0, 4);
        return year && Number(year) !== PROJECTION_YEAR;
      })
      .map((row) => row.id) ?? [];

  if (wrongYearIds.length > 0) {
    const { error } = await supabase
      .from("reservations")
      .delete()
      .in("id", wrongYearIds);

    if (error) {
      throw new Error(`Suppression anciennes projections : ${error.message}`);
    }

    console.log(
      `✓ ${wrongYearIds.length} réservation(s) hors exercice ${PROJECTION_LABEL} supprimée(s)`
    );
  }

  const { count } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", vehicleId)
    .gte("start_date", `${PROJECTION_YEAR}-01-01`)
    .lte("start_date", `${PROJECTION_YEAR}-12-31`)
    .like("customer_name", "Client projection %");

  if ((count ?? 0) >= MONTHLY_PROJECTION.length) {
    console.log(
      `ℹ Projection ${PROJECTION_LABEL} (${PROJECTION_YEAR}) déjà en base — mise à jour des parts prix pro`
    );

    for (const month of MONTHLY_PROJECTION) {
      const { start, end } = monthDateRange(
        PROJECTION_YEAR,
        month.month,
        month.daysRented
      );
      const distanceKm = month.daysRented * 120;
      const { ownerAmount, companyAmount } = splitAmount(
        month.revenue,
        start,
        end,
        distanceKm
      );
      await supabase
        .from("reservations")
        .update({
          owner_amount: ownerAmount,
          company_amount: companyAmount,
          total_price: month.revenue,
          distance_km: distanceKm,
        })
        .eq("vehicle_id", vehicleId)
        .like(
          "customer_name",
          `Client projection ${String(month.month).padStart(2, "0")}/${PROJECTION_YEAR}%`
        );
    }

    return;
  }

  for (const month of MONTHLY_PROJECTION) {
    const { start, end } = monthDateRange(PROJECTION_YEAR, month.month, month.daysRented);
    const avgKmPerDay = 120;
    const distanceKm = month.daysRented * avgKmPerDay;
    const { ownerAmount, companyAmount } = splitAmount(
      month.revenue,
      start,
      end,
      distanceKm
    );

    const { error } = await supabase.from("reservations").insert({
      vehicle_id: vehicleId,
      customer_name: `Client projection ${String(month.month).padStart(2, "0")}/${PROJECTION_YEAR} (${PROJECTION_LABEL})`,
      customer_email: null,
      start_date: start,
      end_date: end,
      pickup_location: "Beauvais",
      return_location: "Beauvais",
      total_price: month.revenue,
      owner_amount: ownerAmount,
      company_amount: companyAmount,
      distance_km: distanceKm,
      status: "finished",
    });

    if (error) {
      throw new Error(`Réservation mois ${month.month} : ${error.message}`);
    }

    console.log(
      `✓ Réservation ${String(month.month).padStart(2, "0")}/${PROJECTION_YEAR} (${PROJECTION_LABEL}) — ${month.daysRented} j, CA ${month.revenue} € → prop. ${ownerAmount} €`
    );
  }

  const totalRevenue = MONTHLY_PROJECTION.reduce((sum, m) => sum + m.revenue, 0);
  const totalDays = MONTHLY_PROJECTION.reduce((sum, m) => sum + m.daysRented, 0);
  console.log(
    `\n📊 Totaux ${PROJECTION_LABEL} : ${totalDays} jours, ${totalRevenue.toLocaleString("fr-FR")} € CA (${PROJECTION_YEAR})`
  );
}

async function main() {
  const supabase = createAdminClient();

  const ownerId = await ensureOwner(supabase);
  const vehicleId = await ensureVehicle(supabase, ownerId);
  await seedReservations(supabase, vehicleId);

  console.log("\n✅ AM Motion Cars configuré");
  console.log(`   Email propriétaire : ${OWNER_EMAIL}`);
  console.log(`   Mot de passe       : ${OWNER_PASSWORD}`);
  console.log(`   Admin              : /admin/proprietaires/${ownerId}`);
  console.log(`   Fiche publique     : /vehicules/${VEHICLE.slug}\n`);
}

main().catch((error) => {
  console.error("❌", error.message ?? error);
  process.exit(1);
});
