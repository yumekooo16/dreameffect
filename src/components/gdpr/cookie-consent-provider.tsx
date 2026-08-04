"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ACCEPT_ALL_CONSENT,
  REJECT_OPTIONAL_CONSENT,
  readConsentFromDocument,
  writeConsentToDocument,
  type CookieConsent,
} from "@/src/lib/gdpr/cookies";

type CookieConsentContextValue = {
  consent: CookieConsent | null;
  bannerOpen: boolean;
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (preferences: Pick<CookieConsent, "preferences" | "analytics">) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    setConsent(readConsentFromDocument());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CookieConsent) => {
    writeConsentToDocument(next);
    setConsent(next);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist(ACCEPT_ALL_CONSENT());
  }, [persist]);

  const rejectOptional = useCallback(() => {
    persist(REJECT_OPTIONAL_CONSENT());
  }, [persist]);

  const savePreferences = useCallback(
    (preferences: Pick<CookieConsent, "preferences" | "analytics">) => {
      persist({
        ...REJECT_OPTIONAL_CONSENT(),
        ...preferences,
        updatedAt: new Date().toISOString(),
      });
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      consent,
      bannerOpen: hydrated && !consent,
      preferencesOpen,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [
      acceptAll,
      consent,
      hydrated,
      preferencesOpen,
      rejectOptional,
      savePreferences,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}
