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

/** Destination après acceptation d'une invitation (choix du mot de passe). */
export const OWNER_INVITE_NEXT_PATH = "/auth/definir-mot-de-passe";

/**
 * URL de retour Auth (courte, sans query).
 * Important Safari/iOS : le redirect_to ne doit pas être trop long ni passer
 * par une redirection apex→www (sinon le #access_token est perdu).
 * Le callback bascule ensuite vers OWNER_INVITE_NEXT_PATH par défaut.
 */
export function authCallbackUrl(_nextPath = OWNER_INVITE_NEXT_PATH) {
  return `${SITE_URL}/auth/callback`;
}

/**
 * Lien d'invitation court pour iPhone/Safari/WhatsApp.
 * Évite le ConfirmationURL Supabase (JWT dans le hash = URL trop longue).
 *
 * Template email Supabase (Authentication → Emails → Invite) recommandé :
 *   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite
 * Site URL dashboard : https://www.dreameffect.fr
 */
export function buildOwnerInviteAppLink(tokenHash: string) {
  const url = new URL(`${SITE_URL}/auth/callback`);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", "invite");
  return url.toString();
}
