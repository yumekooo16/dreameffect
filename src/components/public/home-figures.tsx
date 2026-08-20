import Link from "next/link";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

const FIGURES = [
  {
    value: "24 h",
    label: "Délai de réponse habituel, par WhatsApp ou téléphone.",
  },
  {
    value: "Oise & Eure",
    label: "Beauvais, Gisors et les communes alentour, remise des clés sur rendez-vous.",
  },
  {
    value: "Clé en main",
    label: "Réservations, accueil, nettoyage et suivi — vous n'avez rien à gérer.",
  },
];

export default function HomeFigures() {
  return (
    <section className="de-section" aria-labelledby="home-figures-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <p className="de-section-eyebrow">Repères</p>
          <h2 id="home-figures-title" className="de-display de-section-title">
            Une conciergerie, deux publics
          </h2>
          <p className="de-section-description">
            Locataires exigeants et propriétaires qui souhaitent confier leur
            véhicule — le même niveau de suivi.
          </p>
        </div>

        <div className="de-figures">
          {FIGURES.map((item) => (
            <article key={item.value} className="de-figure">
              <p className="de-figure-value">{item.value}</p>
              <p className="de-figure-label">{item.label}</p>
            </article>
          ))}
        </div>

        <div className="de-audience-split de-audience-split--spaced">
          <article className="de-audience-card">
            <p className="de-section-eyebrow">Locataires</p>
            <h3 className="de-display">Louer un véhicule haut de gamme</h3>
            <p>
              Catalogue en ligne, tarifs affichés, remise des clés organisée.
              Vous réservez, nous préparons le véhicule.
            </p>
            <Link href={PUBLIC_ROUTES.vehicles} className="de-btn de-btn-primary">
              Voir la flotte
            </Link>
          </article>

          <article className="de-audience-card de-audience-card--offset">
            <p className="de-section-eyebrow">Propriétaires</p>
            <h3 className="de-display">Faire travailler votre véhicule</h3>
            <p>
              Revenus mensuels consultables, prise en charge totale et
              transparence sur chaque location. Vous restez propriétaire.
            </p>
            <Link href={PUBLIC_ROUTES.owners} className="de-btn de-btn-ghost">
              Confier mon véhicule
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
