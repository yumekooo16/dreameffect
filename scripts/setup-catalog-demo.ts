/**
 * Applique la migration catalogue + insère des véhicules de démo.
 *
 * Usage : npx tsx scripts/setup-catalog-demo.ts
 *
 * Prérequis : SUPABASE_SERVICE_ROLE_KEY dans .env.local
 * Optionnel : DATABASE_URL pour appliquer la migration SQL automatiquement
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { buildVehicleSlug } from "@/src/lib/public/vehicle-slug";
import { deriveDailyRate } from "@/src/lib/vehicles/pricing";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const DEMO_OWNER_EMAIL = "demo.proprietaire@dreameffect.fr";
const DEMO_OWNER_PASSWORD = "DemoOwner2026!";

const DEMO_VEHICLES = [
  {
    brand: "BMW",
    model: "M2",
    version: "Competition",
    year: 2023,
    color: "Noir",
    mileage: 12000,
    status: "available",
    pricing: {
      price_24h_weekday: 350,
      price_24h_weekend: 420,
      price_48h_weekend: 780,
      price_72h_weekend: 1100,
      price_7_days: 2100,
      deposit: 3000,
    },
    fuel: "essence",
    transmission: "automatique",
    power: 450,
    location: "Paris",
    description:
      "BMW M2 Competition — compacte sportive, parfaite pour une escapade urbaine ou une route sinueuse. Entretien suivi, état impeccable.",
  },
  {
    brand: "Porsche",
    model: "911",
    version: "Carrera S",
    year: 2022,
    color: "Gris",
    mileage: 8500,
    status: "available",
    pricing: {
      price_24h_weekday: 650,
      price_24h_weekend: 750,
      price_48h_weekend: 1400,
      price_72h_weekend: 2000,
      price_7_days: 3800,
      deposit: 5000,
    },
    fuel: "essence",
    transmission: "automatique",
    power: 450,
    location: "Côte d'Azur",
    description:
      "Porsche 911 Carrera S — l'icône. Puissance, élégance et sensations pures. Idéale pour un week-end d'exception.",
  },
  {
    brand: "Mercedes",
    model: "Classe G",
    version: "AMG 63",
    year: 2024,
    color: "Blanc",
    mileage: 5000,
    status: "rented",
    pricing: {
      price_24h_weekday: 800,
      price_24h_weekend: 950,
      price_48h_weekend: 1750,
      price_72h_weekend: 2500,
      price_7_days: 4800,
      deposit: 6000,
    },
    fuel: "essence",
    transmission: "automatique",
    power: 585,
    location: "Lyon",
    description:
      "Mercedes Classe G AMG 63 — présence, confort et caractère. Un SUV d'exception pour voyager avec style.",
  },
];

async function applyMigrationIfPossible() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.log("ℹ DATABASE_URL absent — migration SQL à exécuter manuellement dans Supabase.");
    console.log("  Fichiers : supabase/migrations/20260731180000_public_vehicle_catalog.sql");
    console.log("           supabase/migrations/20260731190000_vehicle_pricing_tiers.sql\n");
    return false;
  }

  try {
    const { Client } = await import("pg");
    const sql = fs.readFileSync(
      path.join(process.cwd(), "supabase/migrations/20260731180000_public_vehicle_catalog.sql"),
      "utf8"
    );
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log("✓ Migration catalogue appliquée via DATABASE_URL");
    return true;
  } catch (error) {
    console.warn("⚠ Migration automatique impossible :", error);
    return false;
  }
}

async function ensureDemoOwner(supabase: ReturnType<typeof createAdminClient>) {
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let user = listData.users.find(
    (u) => u.email?.toLowerCase() === DEMO_OWNER_EMAIL.toLowerCase()
  );

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_OWNER_EMAIL,
      password: DEMO_OWNER_PASSWORD,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new Error(`Création propriétaire démo : ${error?.message ?? "échec"}`);
    }

    user = data.user;
    console.log("✓ Propriétaire démo créé :", DEMO_OWNER_EMAIL);
  } else {
    console.log("✓ Propriétaire démo existant :", DEMO_OWNER_EMAIL);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      first_name: "Jean",
      last_name: "Dupont",
      role: "owner",
      phone: "+33 6 12 34 56 78",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(`Profil propriétaire : ${profileError.message}`);
  }

  return user.id;
}

async function seedVehicles(
  supabase: ReturnType<typeof createAdminClient>,
  ownerId: string,
  hasCatalogColumns: boolean
) {
  const { count } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    console.log(`ℹ ${count} véhicule(s) déjà en base — seed ignoré`);
    return;
  }

  for (const demo of DEMO_VEHICLES) {
    const slug = buildVehicleSlug(demo.brand, demo.model, demo.version);
    const base = {
      owner_id: ownerId,
      brand: demo.brand,
      model: demo.model,
      version: demo.version,
      year: demo.year,
      color: demo.color,
      mileage: demo.mileage,
      status: demo.status,
    };

    const payload = hasCatalogColumns
      ? {
          ...base,
          slug,
          ...demo.pricing,
          daily_rate: deriveDailyRate(demo.pricing),
          fuel: demo.fuel,
          transmission: demo.transmission,
          power: demo.power,
          location: demo.location,
          description: demo.description,
          is_published: true,
        }
      : base;

    const { error } = await supabase.from("vehicles").insert(payload);

    if (error) {
      throw new Error(`Insert ${demo.brand} ${demo.model} : ${error.message}`);
    }

    console.log(`✓ Véhicule ajouté : ${demo.brand} ${demo.model}`);
  }
}

async function catalogColumnsReady(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase.from("vehicles").select("slug").limit(1);
  return !error;
}

async function main() {
  const supabase = createAdminClient();

  await applyMigrationIfPossible();
  const hasCatalogColumns = await catalogColumnsReady(supabase);

  if (!hasCatalogColumns) {
    console.log(
      "⚠ Colonnes catalogue absentes — véhicules créés en mode basique.\n" +
        "  Exécutez la migration SQL dans Supabase → SQL Editor, puis relancez ce script.\n"
    );
  }

  const ownerId = await ensureDemoOwner(supabase);
  await seedVehicles(supabase, ownerId, hasCatalogColumns);

  const { count } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true });

  console.log(`\n✅ Terminé — ${count ?? 0} véhicule(s) en base`);
  console.log("→ Ouvrez http://localhost:3000/vehicules\n");
}

main().catch((error) => {
  console.error("❌", error.message ?? error);
  process.exit(1);
});
