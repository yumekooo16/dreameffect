import Link from "next/link";
import { CONTACT_EMAIL } from "@/src/lib/public/contact";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

type LegalSectionProps = {
  children: React.ReactNode;
};

export function LegalSection({ children }: LegalSectionProps) {
  return (
    <section className="de-public-section">
      <div className="de-public-container de-legal-content">{children}</div>
    </section>
  );
}

export function LegalPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <LegalSection>
      <div className="de-legal-notice">
        <p className="de-label">Document en cours de finalisation</p>
        <h2 className="de-display mt-3 text-2xl tracking-tight">{title}</h2>
        <p className="mt-4 text-sm leading-relaxed de-muted">{description}</p>
        <p className="mt-4 text-sm leading-relaxed de-muted">
          En attendant, vous pouvez consulter notre{" "}
          <Link href={LEGAL_ROUTES.cookies} className="de-link-inline">
            politique cookies
          </Link>{" "}
          ou nous écrire à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="de-link-inline">
            {CONTACT_EMAIL}
          </a>{" "}
          pour toute question relative à vos données personnelles.
        </p>
      </div>
    </LegalSection>
  );
}
