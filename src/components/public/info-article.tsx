import type { ReactNode } from "react";
import type { InfoBlock } from "@/src/lib/public/info-content";

export function InfoArticle({ blocks }: { blocks: InfoBlock[] }) {
  return (
    <section className="de-public-section">
      <div className="de-public-container de-legal-content">
        <div className="de-legal-stack">
          {blocks.map((block) => (
            <section key={block.title}>
              <h2 className="de-display text-xl tracking-tight">{block.title}</h2>
              {block.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-relaxed de-muted">
                  {paragraph}
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
        </div>
      </div>
    </section>
  );
}

export function InfoCta({ children }: { children: ReactNode }) {
  return (
    <section className="de-section de-section-alt">
      <div className="de-public-container de-info-cta">{children}</div>
    </section>
  );
}
