import { WHATSAPP_URL } from "@/src/lib/constants";

export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "06 16 32 03 81";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@dreameffect.fr";

export const CONTACT_WHATSAPP_URL = WHATSAPP_URL;

/** Réseaux sociaux — à compléter lorsque les comptes seront disponibles. */
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? null,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? null,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? null,
} as const;

/** Format E.164 (+33…) pour schema.org / tel: international. */
export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("33")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) {
    return `+33${digits.slice(1)}`;
  }
  if (digits.length > 0) return `+${digits}`;
  return phone;
}

export const CONTACT_PHONE_E164 = formatPhoneE164(CONTACT_PHONE);
