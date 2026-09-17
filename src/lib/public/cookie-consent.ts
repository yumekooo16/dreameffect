/** Consentement cookies — stockage local uniquement (pas de tracking tiers). */

export const COOKIE_CONSENT_KEY = "de-cookie-consent";
export const COOKIE_CONSENT_VERSION = "1";

export type CookieConsentValue = {
  version: string;
  acceptedAt: string;
  /** Cookies techniques uniquement pour l’instant. */
  necessary: true;
};

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentValue;
    if (parsed?.version !== COOKIE_CONSENT_VERSION || !parsed.necessary) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeCookieConsent(): CookieConsentValue {
  const value: CookieConsentValue = {
    version: COOKIE_CONSENT_VERSION,
    acceptedAt: new Date().toISOString(),
    necessary: true,
  };

  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  return value;
}
