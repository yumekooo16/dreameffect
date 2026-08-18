import { HOME_FAQ_ITEMS } from "@/src/lib/public/home-content";

export default function HomeFaqSection() {
  return (
    <section className="de-faq-section" aria-labelledby="home-faq-title">
      <div className="de-public-container de-faq-wrap">
        <p className="de-hero-eyebrow de-faq-eyebrow">Questions fréquentes</p>
        <h2 id="home-faq-title" className="de-display de-faq-heading">
          Ce que vous souhaitez savoir
        </h2>

        <div className="de-faq-list">
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
