import Link from "next/link";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

const FIGURES = [
  {
    value: "24 h",
    label: "Délai de réponse habituel, WhatsApp ou téléphone.",
  },
  {
    value: "60000 · 27140",
    label: "Beauvais et Gisors — remise des clés sur rendez-vous.",
  },
  {
    value: "Clé en main",
    label: "Réservations, accueil, nettoyage et suivi.",
  },
];

export default function HomeFigures() {
  return (
    <section className="de-keys-section" aria-labelledby="home-figures-title">
      <div className="de-public-container">
        <p className="de-keys-eyebrow">Deux chemins</p>
        <h2 id="home-figures-title" className="de-keys-h2">
          Louer ou confier — même exigence
        </h2>
        <p className="de-keys-lede">
          Que vous cherchiez un véhicule ou un partenaire de gestion, DreamEffect
          reste votre interlocuteur unique.
        </p>

        <div className="de-keys-figures">
          {FIGURES.map((item) => (
            <article key={item.value} className="de-keys-figure">
              <p className="de-keys-figure-value">{item.value}</p>
              <p className="de-keys-figure-label">{item.label}</p>
            </article>
          ))}
        </div>

        <div className="de-keys-duo">
          <article className="de-keys-duo-panel">
            <p className="de-keys-eyebrow">Locataires</p>
            <h3>Louer, simplement</h3>
            <p>
              Catalogue en ligne, tarifs affichés, véhicule préparé. Vous choisissez
              les dates — nous organisons la remise des clés.
            </p>
            <Link href={PUBLIC_ROUTES.vehicles} className="de-keys-link">
              Voir la flotte
            </Link>
          </article>
          <article className="de-keys-duo-panel">
            <p className="de-keys-eyebrow">Propriétaires</p>
            <h3>Faire travailler le vôtre</h3>
            <p>
              Revenus mensuels consultables, prise en charge totale, transparence sur
              chaque location. Vous restez propriétaire.
            </p>
            <Link href={PUBLIC_ROUTES.owners} className="de-keys-link">
              Confier mon véhicule
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
