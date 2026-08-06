/** Numéro WhatsApp DreamEffect (sans +), configurable via .env */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "33616320381";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Bonjour DreamEffect, j'aurais besoin de quelques renseignements."
)}`;

/** Construit un lien WhatsApp vers un numéro (format international sans +). */
export function buildWhatsAppUrl(
  phone: string,
  message = "Bonjour, l'équipe DreamEffect souhaite vous contacter."
) {
  const digits = phone.replace(/\D/g, "");
  const normalized =
    digits.startsWith("0") && digits.length === 10
      ? `33${digits.slice(1)}`
      : digits;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
