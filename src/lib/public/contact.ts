import { WHATSAPP_URL } from "@/src/lib/constants";

export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+33 6 00 00 00 00";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@dreameffect.fr";

export const CONTACT_WHATSAPP_URL = WHATSAPP_URL;

/** Réseaux sociaux — à compléter lorsque les comptes seront disponibles. */
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? null,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? null,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? null,
} as const;
