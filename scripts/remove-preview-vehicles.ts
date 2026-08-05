/**
 * Supprime les véhicules de test ajoutés par seed-preview-vehicles.ts.
 * Conserve la BMW Serie 2 (et tout véhicule hors liste preview).
 *
 * Usage : npx tsx scripts/remove-preview-vehicles.ts
 */

import dotenv from "dotenv";
import { createAdminClient } from "@/src/lib/supabase/admin";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const PREVIEW_SLUGS = [
  "audi-rs3-sportback",
  "mercedes-benz-a45-s-amg",
  "porsche-macan-s",
  "bmw-x5-xdrive40d",
  "volkswagen-golf-8-r",
  "range-rover-velar-p400",
] as const;

const SERIE2_SLUG = "bmw-serie-2-gran-coupe";

async function main() {
  const supabase = createAdminClient();

  for (const slug of PREVIEW_SLUGS) {
    const { data, error: findError } = await supabase
      .from("vehicles")
      .select("id, brand, model")
      .eq("slug", slug)
      .maybeSingle();

    if (findError) {
      throw new Error(`Recherche ${slug} : ${findError.message}`);
    }

    if (!data) {
      console.log(`– ${slug} (absent)`);
      continue;
    }

    await supabase.from("vehicle_images").delete().eq("vehicle_id", data.id);
    const { error } = await supabase.from("vehicles").delete().eq("id", data.id);

    if (error) {
      throw new Error(`Suppression ${slug} : ${error.message}`);
    }

    console.log(`✓ Supprimé : ${data.brand} ${data.model}`);
  }

  const { data: serie2, error: serie2Error } = await supabase
    .from("vehicles")
    .select("id, image_url, status, is_published")
    .eq("slug", SERIE2_SLUG)
    .maybeSingle();

  if (serie2Error) {
    throw new Error(`Recherche Serie 2 : ${serie2Error.message}`);
  }

  if (serie2) {
    const { error: fixError } = await supabase
      .from("vehicles")
      .update({
        status: "available",
        is_published: true,
        public_image_url: null,
      })
      .eq("id", serie2.id);

    if (fixError) {
      throw new Error(`Correction Serie 2 : ${fixError.message}`);
    }

    console.log("✓ BMW Serie 2 — disponible et publiée");
  } else {
    console.log("⚠ BMW Serie 2 introuvable");
  }

  const { count } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true });

  console.log(`\n✅ ${count ?? 0} véhicule(s) restant(s) en base`);
}

main().catch((error) => {
  console.error("❌", error.message ?? error);
  process.exit(1);
});
