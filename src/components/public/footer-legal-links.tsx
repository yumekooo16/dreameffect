import Link from "next/link";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

export default function FooterLegalLinks() {
  return (
    <ul className="de-footer-links">
      <li>
        <Link href={LEGAL_ROUTES.terms}>Conditions de location</Link>
      </li>
      <li>
        <Link href={LEGAL_ROUTES.privacy}>Politique de confidentialité</Link>
      </li>
      <li>
        <Link href={LEGAL_ROUTES.legal}>Mentions légales</Link>
      </li>
    </ul>
  );
}
