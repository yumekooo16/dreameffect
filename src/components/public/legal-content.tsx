import Link from "next/link";
import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/src/lib/public/contact";
import type { LegalBlock } from "@/src/lib/public/legal";
import { LEGAL_ROUTES } from "@/src/lib/public/site";

type LegalSectionProps = {
  children: ReactNode;
};

export function LegalSection({ children }: LegalSectionProps) {
  return (
    <section className="de-public-section">
      <div className="de-public-container de-legal-content">{children}</div>
    </section>
  );
}

function formatInlineLinks(text: string) {
  const routes = Object.values(LEGAL_ROUTES);
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const match = routes
      .map((route) => ({ route, index: remaining.indexOf(route) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => a.index - b.index)[0];

    if (!match) {
      parts.push(remaining);
      break;
    }

    if (match.index > 0) {
      parts.push(remaining.slice(0, match.index));
    }

    parts.push(
      <Link key={`legal-link-${key}`} href={match.route} className="de-link-inline">
        {match.route}
      </Link>
    );
    key += 1;
    remaining = remaining.slice(match.index + match.route.length);
  }

  return parts;
}

export function LegalDocument({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <LegalSection>
      <div className="de-legal-stack">
        {blocks.map((block) => (
          <section key={block.title}>
            <h2 className="de-display text-xl tracking-tight">{block.title}</h2>
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed de-muted">
                {formatInlineLinks(paragraph)}
              </p>
            ))}
            {block.bullets && block.bullets.length > 0 ? (
              <ul className="de-legal-bullets">
                {block.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <p className="text-sm leading-relaxed de-muted">
          Une question ? Écrivez à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="de-link-inline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </LegalSection>
  );
}
