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
  const countRes = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true });

  console.log("Total véhicules:", countRes.count);

  const full = await supabase
    .from("vehicles")
    .select(
      "id, brand, model, slug, is_published, daily_rate, status, image_url"
    )
    .limit(10);

  if (full.error) {
    console.log("Colonnes catalogue:", "NON APPLIQUÉES");
    console.log("Erreur:", full.error.message);

    const basic = await supabase
      .from("vehicles")
      .select("id, brand, model, status, image_url")
      .limit(10);

    console.log("\nVéhicules (colonnes de base):");
    console.log(JSON.stringify(basic.data, null, 2));
    return;
  }

  console.log("Colonnes catalogue:", "OK");
  console.log("\nVéhicules:");
  console.log(JSON.stringify(full.data, null, 2));

  const published = full.data?.filter((v) => v.is_published !== false) ?? [];
  console.log(`\nPubliés (échantillon): ${published.length}/${full.data?.length ?? 0}`);
}

main().catch(console.error);
