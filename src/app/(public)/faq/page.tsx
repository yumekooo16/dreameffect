import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FAQ_ITEMS as OWNERS_FAQ } from "@/src/components/public/owners-faq";
import JsonLd from "@/src/components/public/json-ld";
import PageHero from "@/src/components/public/page-hero";
import { HOME_FAQ_ITEMS } from "@/src/lib/public/home-content";
import { LOCAL_KEYWORDS, formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
} from "@/src/lib/public/seo";
import { INFO_ROUTES, PUBLIC_ROUTES } from "@/src/lib/public/site";

const FAQ_PAGE_ITEMS = [...HOME_FAQ_ITEMS, ...OWNERS_FAQ];

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — Location & conciergerie automobile",
  description: `Questions fréquentes DreamEffect (${formatServiceAreaLabel()}) : tarifs, réservation, remise des clés, assurance, gestion locative pour propriétaires.`,
  path: INFO_ROUTES.faq,
  keywords: [
    ...LOCAL_KEYWORDS,
    "FAQ location voiture",
    "questions location véhicule",
    "FAQ conciergerie automobile",
  ],
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "FAQ", path: INFO_ROUTES.faq },
          ]),
          faqPageJsonLd(FAQ_PAGE_ITEMS),
        ]}
      />
      <PageHero
        eyebrow="Aide"
        title="Questions fréquentes"
        description={`Location, remise des clés et gestion locative — ${formatServiceAreaLabel()}.`}
      />
      <section className="de-keys-section" aria-labelledby="faq-page-title">
        <div className="de-public-container">
          <h2 id="faq-page-title" className="sr-only">
            Liste des questions
          </h2>
          <div className="de-keys-faq-col" style={{ maxWidth: "48rem" }}>
            {FAQ_PAGE_ITEMS.map(({ question, answer }) => (
              <details key={question} className="de-keys-faq-item">
                <summary>{question}</summary>
                <p className="de-keys-faq-a">{answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={PUBLIC_ROUTES.vehicles} className="de-btn de-btn-primary">
              Voir la flotte
              <ArrowRight size={16} />
            </Link>
            <Link href={PUBLIC_ROUTES.contact} className="de-btn de-btn-ghost">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
