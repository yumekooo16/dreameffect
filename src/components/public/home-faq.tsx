import { HOME_FAQ_ITEMS } from "@/src/lib/public/home-content";
import { FAQ_ITEMS as OWNERS_FAQ } from "@/src/components/public/owners-faq";
import Link from "next/link";
import { INFO_ROUTES, PUBLIC_ROUTES } from "@/src/lib/public/site";

/** FAQ visibles sur l’accueil — alignées avec le JSON-LD FAQPage. */
export function getVisibleHomeFaqItems() {
  const renterFaqs = [
    HOME_FAQ_ITEMS[0],
    HOME_FAQ_ITEMS[2],
    HOME_FAQ_ITEMS[3],
    HOME_FAQ_ITEMS[4],
  ];
  const ownerFaqs = [HOME_FAQ_ITEMS[5], ...OWNERS_FAQ.slice(0, 3)];
  return { renterFaqs, ownerFaqs, all: [...renterFaqs, ...ownerFaqs] };
}

export default function HomeFaqSection() {
  const { renterFaqs, ownerFaqs } = getVisibleHomeFaqItems();

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
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <Link href={PUBLIC_ROUTES.owners} className="de-keys-link">
                Tout sur la gestion locative
              </Link>
              <Link href={INFO_ROUTES.faq} className="de-keys-link">
                Voir toute la FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { HOME_FAQ_ITEMS };
