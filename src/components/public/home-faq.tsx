import { HOME_FAQ_ITEMS } from "@/src/lib/public/home-content";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import Link from "next/link";

export default function HomeFaqSection() {
  return (
    <section className="de-section" aria-labelledby="home-faq-title">
      <div className="de-public-container de-faq-manifest">
        <div>
          <p className="de-motion-eyebrow">Locataires</p>
          <h2 id="home-faq-title" className="de-motion-section-title">
            Ce que vous souhaitez savoir
          </h2>
          <p className="de-motion-page-lead">
            Disponibilités, remise des clés et réservation. Pour la mise en gestion,
            voir la page propriétaires.
          </p>
          <Link href={PUBLIC_ROUTES.owners} className="de-text-cta">
            Vos questions de propriétaire
          </Link>
        </div>

        <div>
          {HOME_FAQ_ITEMS.map(({ question, answer }) => (
            <details key={question} className="de-faq-item">
              <summary>{question}</summary>
              <p className="de-faq-item-a">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HOME_FAQ_ITEMS };
