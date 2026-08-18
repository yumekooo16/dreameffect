export const CONSENT_COOKIE_NAME = "de-cookie-consent";
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182; // ~6 mois
export const CONSENT_VERSION = 1;

export type CookieCategory = "essential" | "preferences" | "analytics";

export type CookieConsent = {
  version: number;
  essential: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
};

export type CookieDefinition = {
  category: CookieCategory;
  name: string;
  purpose: string;
  duration: string;
  provider: string;
};

export const COOKIE_DEFINITIONS: CookieDefinition[] = [
  {
    category: "essential",
    name: "de-cookie-consent",
    purpose: "Mémorise votre choix concernant les cookies.",
    duration: "6 mois",
    provider: "DreamEffect",
  },
  {
    category: "essential",
    name: "Cookies Supabase (sb-*)",
    purpose: "Session de connexion sécurisée (espace admin / propriétaire).",
    duration: "Session ou durée de connexion",
    provider: "Supabase",
  },
  {
    category: "preferences",
    name: "de-remember-auth",
    purpose: "Mémorise l'option « Rester connecté » sur la page de login.",
    duration: "30 jours",
    provider: "DreamEffect",
  },
  {
    category: "preferences",
    name: "de-remember-email",
    purpose: "Préremplit votre email sur la page de login (localStorage).",
    duration: "Jusqu'à suppression manuelle",
    provider: "DreamEffect",
  },
];

export const DEFAULT_CONSENT: CookieConsent = {
  version: CONSENT_VERSION,
  essential: true,
  preferences: false,
  analytics: false,
  updatedAt: new Date(0).toISOString(),
};

/** Aligne « Tout accepter » sur /cookies : pas de mesure d'audience à ce jour. */
export const ACCEPT_ALL_CONSENT = (): CookieConsent => ({
  version: CONSENT_VERSION,
  essential: true,
  preferences: true,
  analytics: false,
  updatedAt: new Date().toISOString(),
});

export const REJECT_OPTIONAL_CONSENT = (): CookieConsent => ({
  version: CONSENT_VERSION,
  essential: true,
  preferences: false,
  analytics: false,
  updatedAt: new Date().toISOString(),
});

export function parseConsentCookie(raw: string | null | undefined): CookieConsent | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as CookieConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializeConsent(consent: CookieConsent): string {
  return encodeURIComponent(JSON.stringify(consent));
}

export function readConsentFromDocument(): CookieConsent | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!match) return null;
  return parseConsentCookie(match.slice(CONSENT_COOKIE_NAME.length + 1));
}

export function writeConsentToDocument(consent: CookieConsent) {
  document.cookie = `${CONSENT_COOKIE_NAME}=${serializeConsent(consent)}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function hasOptionalConsent(consent: CookieConsent | null) {
  return Boolean(consent?.preferences || consent?.analytics);
}
