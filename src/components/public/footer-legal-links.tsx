"use client";

import Link from "next/link";
import { ManageCookiesButton } from "@/src/components/gdpr/gdpr-consent-field";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export default function FooterLegalLinks() {
  return (
    <ul className="de-footer-links">
      <li>
        <Link href={LEGAL_ROUTES.cookies}>Politique cookies</Link>
      </li>
      <li>
        <Link href={LEGAL_ROUTES.privacy}>Politique de confidentialité</Link>
      </li>
      <li>
        <Link href={LEGAL_ROUTES.legal}>Mentions légales</Link>
      </li>
      <li>
        <ManageCookiesButton />
      </li>
    </ul>
  );
}
