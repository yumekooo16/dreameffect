/** Retourne l'URL si elle est utilisable par next/image, sinon null. */
export function getValidImageUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;

  const trimmed = url.trim();

  if (trimmed.startsWith("/")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

const VEHICLE_IMAGES_BUCKET = "vehicle-images";

/** Résout une URL véhicule (http, chemin public ou clé Supabase Storage). */
export function resolveVehicleImageUrl(path?: string | null): string | null {
  const direct = getValidImageUrl(path);
  if (direct) return direct;

  if (!path?.trim()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  return `${supabaseUrl}/storage/v1/object/public/${VEHICLE_IMAGES_BUCKET}/${encodeURI(path.trim())}`;
}
