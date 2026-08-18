"use client";

import Link from "next/link";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

type GdprConsentFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
};

export default function GdprConsentField({
  checked,
  onChange,
  error,
  id = "gdpr-consent",
}: GdprConsentFieldProps) {
  return (
    <div className="de-form-field">
      <label htmlFor={id} className="de-gdpr-consent-label">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="de-checkbox mt-0.5"
          required
        />
        <span className="text-sm leading-relaxed de-muted">
          J&apos;accepte que mes données personnelles soient utilisées par DreamEffect
          pour traiter ma demande.{" "}
          <Link href={LEGAL_ROUTES.privacy} className="de-link-inline">
            Politique de confidentialité
          </Link>
          .
        </span>
      </label>
      {error && <p className="de-form-error">{error}</p>}
    </div>
  );
}
