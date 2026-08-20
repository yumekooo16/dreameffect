import { HOME_FAQ_ITEMS } from "@/src/lib/public/home-content";
import { FAQ_ITEMS as OWNERS_FAQ } from "@/src/components/public/owners-faq";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeFaqSection() {
  const renterFaqs = HOME_FAQ_ITEMS.slice(0, 4);
  const ownerFaqs = OWNERS_FAQ.slice(0, 4);

  return (
    <section className="de-keys-section de-keys-section--paper" aria-labelledby="home-faq-title">
      <div className="de-public-container">
        <p className="de-keys-eyebrow">Questions</p>
        <h2 id="home-faq-title" className="de-keys-h2">
          Ce qu&apos;il faut savoir
        </h2>
        <p className="de-keys-lede">
          Deux regards — locataire et propriétaire — pour répondre avant de vous
          engager.
        </p>

        <div className="de-keys-faq-grid">
          <div>
            <p className="de-keys-eyebrow">Locataires</p>
            <div className="de-keys-faq-col" style={{ marginTop: "0.75rem" }}>
              {renterFaqs.map(({ question, answer }) => (
                <details key={question} className="de-keys-faq-item">
                  <summary>{question}</summary>
                  <p className="de-keys-faq-a">{answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div>
            <p className="de-keys-eyebrow">Propriétaires</p>
            <div className="de-keys-faq-col" style={{ marginTop: "0.75rem" }}>
              {ownerFaqs.map(({ question, answer }) => (
                <details key={question} className="de-keys-faq-item">
                  <summary>{question}</summary>
                  <p className="de-keys-faq-a">{answer}</p>
                </details>
              ))}
            </div>
            <Link href={PUBLIC_ROUTES.owners} className="de-keys-link">
              Tout sur la gestion locative
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export { HOME_FAQ_ITEMS };
