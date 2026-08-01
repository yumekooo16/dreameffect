import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.from("vehicles").select("*").limit(1);

  if (error) {
    console.log("Erreur:", error.message);
    return;
  }

  const row = data?.[0];
  if (!row) {
    console.log("Aucun véhicule");
    return;
  }

  console.log("Colonnes disponibles:", Object.keys(row).sort().join(", "));
  console.log("\nPremier véhicule (tarifs):");
  console.log(
    JSON.stringify(
      {
        brand: row.brand,
        model: row.model,
        daily_rate: row.daily_rate,
        price_24h_weekday: row.price_24h_weekday,
        price_24h_weekend: row.price_24h_weekend,
        price_48h_weekend: row.price_48h_weekend,
        price_72h_weekend: row.price_72h_weekend,
        price_7_days: row.price_7_days,
        deposit: row.deposit,
        is_published: row.is_published,
        slug: row.slug,
      },
      null,
      2
    )
  );

  const { data: all } = await supabase
    .from("vehicles")
    .select("id, brand, model, daily_rate")
    .limit(10);
  console.log("\nTous les véhicules:");
  console.log(JSON.stringify(all, null, 2));
}

main().catch(console.error);
