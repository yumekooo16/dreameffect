/**
 * Ajoute des véhicules de preview (catalogue public) avec photos Unsplash.
 * Idempotent : upsert par slug — relançable sans doublon.
 *
 * Usage : npx tsx scripts/seed-preview-vehicles.ts
 */

import dotenv from "dotenv";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { buildVehicleSlug } from "@/src/lib/public/vehicle-slug";
import { deriveDailyRate } from "@/src/lib/vehicles/pricing";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const DEMO_OWNER_EMAIL = "demo.proprietaire@dreameffect.fr";
const DEMO_OWNER_PASSWORD = "DemoOwner2026!";

const PREVIEW_VEHICLES = [
  {
    brand: "Audi",
    model: "RS3",
    version: "Sportback",
    year: 2023,
    color: "Noir",
    mileage: 14200,
    status: "available",
    fuel: "essence",
    transmission: "automatique",
    power: 400,
    location: "Beauvais",
    description:
      "Audi RS3 Sportback — compacte sportive, 400 ch, idéale pour un week-end dans l'Oise. Véhicule préparé avant chaque location.",
    image_url:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80",
    pricing: {
      price_24h_weekday: 280,
      price_24h_weekend: 340,
      price_48h_weekend: 620,
      price_72h_weekend: 890,
      price_7_days: 1650,
      deposit: 2500,
    },
  },
  {
    brand: "Mercedes-Benz",
    model: "A45 S",
    version: "AMG",
    year: 2022,
    color: "Gris",
    mileage: 9800,
    status: "available",
    fuel: "essence",
    transmission: "automatique",
    power: 421,
    location: "Gisors",
    description:
      "Mercedes-AMG A45 S — performance compacte, finitions premium. Disponible à Gisors et dans l'Eure.",
    image_url:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=80",
    pricing: {
      price_24h_weekday: 320,
      price_24h_weekend: 390,
      price_48h_weekend: 720,
      price_72h_weekend: 1020,
      price_7_days: 1890,
      deposit: 2800,
    },
  },
  {
    brand: "Porsche",
    model: "Macan",
    version: "S",
    year: 2021,
    color: "Blanc",
    mileage: 22400,
    status: "available",
    fuel: "essence",
    transmission: "automatique",
    power: 380,
    location: "Beauvais",
    description:
      "Porsche Macan S — SUV sportif, confort et agilité. Parfait pour un déplacement pro ou un séjour en famille.",
    image_url:
      "https://images.unsplash.com/photo-1503376780353-7ad465976fd2?auto=format&fit=crop&w=1600&q=80",
    pricing: {
      price_24h_weekday: 420,
      price_24h_weekend: 490,
      price_48h_weekend: 920,
      price_72h_weekend: 1320,
      price_7_days: 2450,
      deposit: 4000,
    },
  },
  {
    brand: "BMW",
    model: "X5",
    version: "xDrive40d",
    year: 2022,
    color: "Bleu",
    mileage: 31500,
    status: "rented",
    fuel: "diesel",
    transmission: "automatique",
    power: 340,
    location: "Beauvais",
    description:
      "BMW X5 xDrive40d — grand SUV premium, espace et confort. Idéal pour les longs trajets depuis Beauvais-Tillé.",
    image_url:
      "https://images.unsplash.com/photo-1555217690-899696b42312?auto=format&fit=crop&w=1600&q=80",
    pricing: {
      price_24h_weekday: 380,
      price_24h_weekend: 450,
      price_48h_weekend: 840,
      price_72h_weekend: 1190,
      price_7_days: 2200,
      deposit: 3500,
    },
  },
  {
    brand: "Volkswagen",
    model: "Golf",
    version: "8 R",
    year: 2023,
    color: "Bleu",
    mileage: 7600,
    status: "available",
    fuel: "essence",
    transmission: "automatique",
    power: 320,
    location: "Gisors",
    description:
      "Volkswagen Golf 8 R — compacte iconique, 320 ch et transmission intégrale. Disponible à Gisors.",
    image_url:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80",
    pricing: {
      price_24h_weekday: 260,
      price_24h_weekend: 310,
      price_48h_weekend: 580,
      price_72h_weekend: 820,
      price_7_days: 1520,
      deposit: 2200,
    },
  },
  {
    brand: "Range Rover",
    model: "Velar",
    version: "P400",
    year: 2023,
    color: "Noir",
    mileage: 11200,
    status: "available",
    fuel: "essence",
    transmission: "automatique",
    power: 400,
    location: "Beauvais",
    description:
      "Range Rover Velar P400 — design épuré, habitacle haut de gamme. Location premium Beauvais et Oise.",
    image_url:
      "https://images.unsplash.com/photo-1519641471654-76ce5427db85?auto=format&fit=crop&w=1600&q=80",
    pricing: {
      price_24h_weekday: 520,
      price_24h_weekend: 590,
      price_48h_weekend: 1100,
      price_72h_weekend: 1580,
      price_7_days: 2950,
      deposit: 5000,
    },
  },
] as const;

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

async function resolveOwnerId(supabase: ReturnType<typeof createAdminClient>) {
  const { data: existingVehicle } = await supabase
    .from("vehicles")
    .select("owner_id")
    .limit(1)
    .maybeSingle();

  if (existingVehicle?.owner_id) {
    return existingVehicle.owner_id as string;
  }

  return ensureDemoOwner(supabase);
}

async function upsertPreviewVehicle(
  supabase: ReturnType<typeof createAdminClient>,
  ownerId: string,
  demo: (typeof PREVIEW_VEHICLES)[number]
) {
  const slug = buildVehicleSlug(demo.brand, demo.model, demo.version);
  const payload = {
    owner_id: ownerId,
    brand: demo.brand,
    model: demo.model,
    version: demo.version,
    year: demo.year,
    color: demo.color,
    mileage: demo.mileage,
    status: demo.status,
    slug,
    ...demo.pricing,
    daily_rate: deriveDailyRate(demo.pricing),
    fuel: demo.fuel,
    transmission: demo.transmission,
    power: demo.power,
    location: demo.location,
    description: demo.description,
    image_url: demo.image_url,
    public_image_url: demo.image_url,
    is_published: true,
  };

  const { data: existing } = await supabase
    .from("vehicles")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("vehicles").update(payload).eq("id", existing.id);
    if (error) throw new Error(`Mise à jour ${slug} : ${error.message}`);
    console.log(`↻ Véhicule mis à jour : ${demo.brand} ${demo.model}`);
    return;
  }

  const { error } = await supabase.from("vehicles").insert(payload);
  if (error) throw new Error(`Insert ${slug} : ${error.message}`);
  console.log(`✓ Véhicule ajouté : ${demo.brand} ${demo.model}`);
}

async function main() {
  const supabase = createAdminClient();
  const ownerId = await resolveOwnerId(supabase);

  for (const vehicle of PREVIEW_VEHICLES) {
    await upsertPreviewVehicle(supabase, ownerId, vehicle);
  }

  const { count } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  console.log(`\n✅ Catalogue preview — ${count ?? 0} véhicule(s) publié(s)`);
  console.log("→ http://localhost:3001/vehicules\n");
}

main().catch((error) => {
  console.error("❌", error.message ?? error);
  process.exit(1);
});
