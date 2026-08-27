/** Prépare une image pour upload (Server Actions / Vercel ~4,5 Mo). */

const MAX_DIMENSION = 2400;
const TARGET_MAX_BYTES = 3.5 * 1024 * 1024;
const INITIAL_QUALITY = 0.85;
const MIN_QUALITY = 0.55;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function isProbablyImage(file: File) {
  if (file.type && ALLOWED_TYPES.has(file.type.toLowerCase())) return true;
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Redimensionne / compresse une image pour rester sous la limite Vercel.
 * Renvoie le fichier d'origine si déjà assez léger ou si la compression échoue.
 */
export async function prepareImageForUpload(
  file: File,
  options?: { preferPng?: boolean }
): Promise<File> {
  if (!isProbablyImage(file)) {
    throw new Error("Format non supporté. Utilisez JPG, PNG ou WebP.");
  }

  // HEIC souvent non décodable par canvas — on laisse passer tel quel
  // (l'utilisateur devra compresser / convertir si ça dépasse la limite).
  if (
    /heic|heif/i.test(file.type) ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  ) {
    if (file.size > TARGET_MAX_BYTES) {
      throw new Error(
        "Photo HEIC trop lourde. Convertissez-la en JPG dans Photos, ou choisissez une image plus légère (max ~3,5 Mo)."
      );
    }
    return file;
  }

  if (file.size <= TARGET_MAX_BYTES && file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (file.size > TARGET_MAX_BYTES) {
      throw new Error(
        "Impossible de compresser cette image. Réessayez en JPG/PNG sous 3,5 Mo."
      );
    }
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const keepPng = Boolean(options?.preferPng) && file.type === "image/png";
  const outputType = keepPng
    ? "image/png"
    : file.type === "image/webp"
      ? "image/webp"
      : file.type === "image/png"
        ? "image/png"
        : "image/jpeg";

  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, outputType, quality);
  let usedType = outputType;

  while (blob && blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 0.1;
    if (!keepPng && usedType === "image/png" && quality <= 0.7) {
      usedType = "image/jpeg";
    }
    blob = await canvasToBlob(canvas, usedType, quality);
  }

  if (!blob) return file;

  if (blob.size > TARGET_MAX_BYTES) {
    throw new Error(
      keepPng
        ? "PNG encore trop lourd. Réduisez la taille ou exportez en JPG sous 3,5 Mo."
        : "Photo encore trop lourde après compression. Essayez une image plus petite."
    );
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  const ext =
    blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";

  return new File([blob], `${baseName}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

export function formatUploadError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const message = error.message?.trim();
  if (!message) return fallback;

  if (/Failed to find Server Action/i.test(message)) {
    return "Session obsolète — rechargez la page puis réessayez.";
  }
  if (/413|Payload Too Large|body.*limit|too large/i.test(message)) {
    return "Fichier trop volumineux pour le serveur. Compressez la photo (max ~3,5 Mo).";
  }
  if (/NEXT_REDIRECT|NEXT_HTTP_ERROR_FALLBACK/i.test(message)) {
    return "Session expirée — reconnectez-vous.";
  }

  return message;
}
