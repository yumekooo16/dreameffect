import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import { LegalSection } from "@/src/components/public/legal-content";
import { COOKIE_DEFINITIONS } from "@/src/lib/gdpr/cookies";
import { buildPageMetadata } from "@/src/lib/public/seo";
import { LEGAL_ROUTES, SITE_NAME } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Politique cookies",
  description: `Informations sur les cookies utilisés par ${SITE_NAME} et la gestion de votre consentement.`,
  path: LEGAL_ROUTES.cookies,
});

const CATEGORY_LABELS = {
  essential: "Essentiels",
  preferences: "Préférences",
} as const;

export default function CookiesPage() {
  const grouped = {
    essential: COOKIE_DEFINITIONS.filter((item) => item.category === "essential"),
    preferences: COOKIE_DEFINITIONS.filter((item) => item.category === "preferences"),
  };

  return (
    <>
      <PageHero
        title="Politique cookies"
        description="Les traceurs utilisés, et vos choix."
      />

      <LegalSection>
        <div className="de-legal-stack">
          <section>
            <h2 className="de-display text-xl tracking-tight">Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="mt-3 text-sm leading-relaxed de-muted">
              Un cookie est un petit fichier déposé sur votre terminal lors de la
              visite d&apos;un site. Il permet notamment de mémoriser vos préférences
              ou de sécuriser votre connexion.
            </p>
          </section>

          {(["essential", "preferences"] as const).map((category) => {
            const items = grouped[category];
            if (items.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="de-display text-xl tracking-tight">
                  {CATEGORY_LABELS[category]}
                </h2>
                <p className="mt-2 text-sm de-muted">
                  {category === "essential"
                    ? "Indispensables au fonctionnement du site. Ils ne nécessitent pas votre consentement."
                    : "Facultatifs — activés uniquement si vous les acceptez."}
                </p>
                <div className="de-legal-table-wrap mt-4">
                  <table className="de-legal-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Finalité</th>
                        <th>Durée</th>
                        <th>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.name}>
                          <td>{item.name}</td>
                          <td>{item.purpose}</td>
                          <td>{item.duration}</td>
                          <td>{item.provider}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}

          <section>
            <h2 className="de-display text-xl tracking-tight">Mesure d&apos;audience</h2>
            <p className="mt-3 text-sm leading-relaxed de-muted">
              Aucun cookie de mesure d&apos;audience (Google Analytics, Matomo ou
              équivalent) n&apos;est déposé actuellement. Le bouton « Tout
              accepter » n&apos;active donc aucun traceur d&apos;audience — uniquement
              les cookies de préférences, s&apos;ils sont concernés.
            </p>
          </section>

          <section>
            <h2 className="de-display text-xl tracking-tight">Modifier votre choix</h2>
            <p className="mt-3 text-sm leading-relaxed de-muted">
              Vous pouvez à tout moment modifier vos préférences via le lien
              « Gérer les cookies » en bas de page. « Tout refuser » et « Tout
              accepter » sont proposés au même niveau.
            </p>
          </section>
        </div>
      </LegalSection>
    </>
  );
}
