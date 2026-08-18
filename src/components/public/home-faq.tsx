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
            Location à Beauvais et Gisors, gestion locative dans l&apos;Oise et
            l&apos;Eure — l&apos;essentiel, clairement.
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
