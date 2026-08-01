export function slugifyVehiclePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildVehicleSlug(
  brand: string,
  model: string,
  version?: string | null
) {
  const parts = [brand, model, version?.trim()].filter(Boolean) as string[];
  const base = slugifyVehiclePart(parts.join(" "));
  return base || "vehicule";
}
