"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCookieConsent } from "@/src/components/gdpr/cookie-consent-provider";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export default function CookieBanner() {
  const {
    bannerOpen,
    preferencesOpen,
    acceptAll,
    rejectOptional,
    savePreferences,
    openPreferences,
    closePreferences,
    consent,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!consent) return;
    setPreferences(consent.preferences);
    setAnalytics(consent.analytics);
  }, [consent]);

  const showPanel = bannerOpen || preferencesOpen;
  if (!showPanel) return null;

  return (
    <div
      className="de-cookie-banner"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      aria-modal="true"
    >
      <div className="de-cookie-banner-panel">
        <div className="de-cookie-banner-content">
          <p id="cookie-banner-title" className="de-display text-base tracking-tight">
            {preferencesOpen && consent ? "Préférences cookies" : "Respect de votre vie privée"}
          </p>

          <p id="cookie-banner-desc" className="mt-2 text-sm leading-relaxed de-muted">
            DreamEffect utilise des cookies essentiels au fonctionnement du site et,
            avec votre accord, des cookies de préférences. Aucun cookie publicitaire
            n&apos;est utilisé à ce jour.{" "}
            <Link href={LEGAL_ROUTES.cookies} className="de-link-inline">
              En savoir plus
            </Link>
          </p>

          {(bannerOpen || preferencesOpen) && (
            <div className="de-cookie-preferences">
              <label className="de-cookie-pref-row">
                <span>
                  <span className="font-medium text-foreground">Essentiels</span>
                  <span className="mt-0.5 block text-xs de-muted">
                    Connexion, sécurité et mémorisation de votre choix cookies.
                  </span>
                </span>
                <input type="checkbox" checked disabled readOnly className="de-checkbox" />
              </label>

              <label className="de-cookie-pref-row">
                <span>
                  <span className="font-medium text-foreground">Préférences</span>
                  <span className="mt-0.5 block text-xs de-muted">
                    Mémorisation de l&apos;email et de l&apos;option « Rester connecté ».
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences}
                  onChange={(event) => setPreferences(event.target.checked)}
                  className="de-checkbox"
                />
              </label>

              <label className="de-cookie-pref-row de-cookie-pref-row--disabled">
                <span>
                  <span className="font-medium text-foreground">Mesure d&apos;audience</span>
                  <span className="mt-0.5 block text-xs de-muted">
                    Non utilisée pour le moment (Google Analytics, etc.).
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  disabled
                  readOnly
                  className="de-checkbox"
                />
              </label>
            </div>
          )}
        </div>

        <div className="de-cookie-banner-actions">
          {!preferencesOpen ? (
            <>
              <button
                type="button"
                className="de-btn de-btn-ghost de-btn-sm"
                onClick={rejectOptional}
              >
                Tout refuser
              </button>
              <button
                type="button"
                className="de-btn de-btn-ghost de-btn-sm"
                onClick={openPreferences}
              >
                Personnaliser
              </button>
              <button
                type="button"
                className="de-btn de-btn-primary de-btn-sm"
                onClick={acceptAll}
              >
                Tout accepter
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="de-btn de-btn-ghost de-btn-sm"
                onClick={() => {
                  if (consent) {
                    closePreferences();
                    return;
                  }
                  rejectOptional();
                }}
              >
                {consent ? "Annuler" : "Tout refuser"}
              </button>
              <button
                type="button"
                className="de-btn de-btn-primary de-btn-sm"
                onClick={() => savePreferences({ preferences, analytics: false })}
              >
                Enregistrer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
