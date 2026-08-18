"use client";

import Link from "next/link";
import { useState } from "react";
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

  const [draftPreferences, setDraftPreferences] = useState<boolean | null>(null);
  const preferences = draftPreferences ?? consent?.preferences ?? false;

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
          <p id="cookie-banner-title" className="de-display text-base">
            {preferencesOpen && consent ? "Préférences cookies" : "Respect de votre vie privée"}
          </p>

          <p id="cookie-banner-desc" className="mt-2 text-sm leading-relaxed de-muted">
            DreamEffect utilise des cookies essentiels au fonctionnement du site et,
            avec votre accord, des cookies de préférences. Aucun cookie publicitaire
            ni de mesure d&apos;audience n&apos;est utilisé à ce jour.{" "}
            <Link href={LEGAL_ROUTES.cookies} className="de-link-inline">
              Politique cookies
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
                  onChange={(event) => setDraftPreferences(event.target.checked)}
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
                className="de-btn de-btn-cookie-reject de-cookie-choice"
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
                className="de-btn de-btn-cookie-accept de-cookie-choice"
                onClick={acceptAll}
              >
                Tout accepter
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="de-btn de-btn-cookie-reject de-cookie-choice"
                onClick={() => {
                  setDraftPreferences(null);
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
                className="de-btn de-btn-cookie-accept de-cookie-choice"
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
