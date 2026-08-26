import { SITE_URL } from "@/src/lib/public/site";

/** Domaines refusés pour un compte propriétaire (pas un vrai contact). */
const BLOCKED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.fr",
  "localhost",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
]);

export function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getEmailDomain(email: string) {
  const at = email.lastIndexOf("@");
  if (at < 0) return "";
  return email.slice(at + 1);
}

export function validateRealOwnerEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) return "Email requis";
  if (!isValidEmailFormat(email)) return "Email invalide";

  const domain = getEmailDomain(email);
  if (!domain || BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return "Utilisez l'email réel du propriétaire (pas un email de test)";
  }

  return null;
}

/** URL de retour après invitation / confirmation email Supabase. */
export function authCallbackUrl(nextPath = "/espace-proprietaire") {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;
}
