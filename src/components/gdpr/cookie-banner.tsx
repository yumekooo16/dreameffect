"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  readCookieConsent,
  writeCookieConsent,
} from "@/src/lib/public/cookie-consent";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!readCookieConsent());
  }, []);

  if (!visible) return null;

  return (
    <div
      className="de-cookie-banner"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="de-cookie-banner-inner">
        <div className="de-cookie-banner-copy">
          <p id="cookie-banner-title" className="de-cookie-banner-title">
            Cookies
          </p>
          <p id="cookie-banner-desc" className="de-cookie-banner-text">
            Ce site utilise uniquement des cookies techniques nécessaires
            (connexion, sécurité). Pas de cookies publicitaires.{" "}
            <Link href={LEGAL_ROUTES.privacy} className="de-link-inline">
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          className="de-btn de-btn-primary"
          onClick={() => {
            writeCookieConsent();
            setVisible(false);
          }}
        >
          Compris
        </button>
      </div>
    </div>
  );
}
