import type { SupabaseClient } from "@supabase/supabase-js";
import { buildVehicleSlug } from "@/src/lib/public/vehicle-slug";

export async function ensureUniqueVehicleSlug(
  supabase: SupabaseClient,
  brand: string,
  model: string,
  version: string | null | undefined,
  excludeId?: string
) {
  const base = buildVehicleSlug(brand, model, version);
  let attempt = 0;

  while (attempt < 100) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;

    const { data } = await supabase
      .from("vehicles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data || data.id === excludeId) {
      return candidate;
    }

    attempt += 1;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
