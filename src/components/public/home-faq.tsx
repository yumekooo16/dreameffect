import { HOME_FAQ_ITEMS } from "@/src/lib/public/home-content";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import Link from "next/link";

export default function HomeFaqSection() {
  return (
    <section className="de-section de-faq-section" aria-labelledby="home-faq-title">
      <div className="de-public-container de-faq-layout">
        <div className="de-faq-intro">
          <p className="de-section-eyebrow">Locataires</p>
          <h2 id="home-faq-title" className="de-display de-section-title">
            Questions fréquentes
          </h2>
          <p className="de-section-lede">
            Disponibilités, remise des clés et réservation. Pour la mise en
            gestion, voir la page propriétaires.
          </p>
          <Link href={PUBLIC_ROUTES.owners} className="de-text-cta">
            Vos questions de propriétaire
          </Link>
        </div>

        <div className="de-faq-editorial">
          {HOME_FAQ_ITEMS.map(({ question, answer }, index) => (
            <details key={question} className="de-faq-row">
              <summary className="de-faq-summary">
                <span className="de-faq-num" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="de-faq-q de-display">{question}</span>
              </summary>
              <p className="de-faq-a">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HOME_FAQ_ITEMS };
