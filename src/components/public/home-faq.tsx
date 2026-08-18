import { HOME_FAQ_ITEMS } from "@/src/lib/public/home-content";

export default function HomeFaqSection() {
  return (
    <section className="de-section de-section-alt" aria-labelledby="home-faq-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <p className="de-section-eyebrow">Questions fréquentes</p>
          <h2 id="home-faq-title" className="de-display de-section-title">
            L&apos;essentiel
          </h2>
          <p className="de-section-description">
            Tarifs, flotte, réservation et remise des clés — les réponses
            utiles, sans détour.
          </p>
        </div>

        <div className="de-owners-faq-list">
          {HOME_FAQ_ITEMS.map(({ question, answer }) => (
            <details key={question} className="de-faq-item">
              <summary className="de-faq-question">{question}</summary>
              <p className="de-faq-answer">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HOME_FAQ_ITEMS };
