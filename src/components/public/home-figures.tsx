import Link from "next/link";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

const FIGURES = [
  {
    value: "24 h",
    label: "Délai de réponse habituel, par WhatsApp ou téléphone.",
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
    <section aria-labelledby="home-figures-title">
      <div className="de-stats-band">
        {FIGURES.map((item) => (
          <article key={item.value} className="de-stat-cell">
            <p className="de-stat-value de-display">{item.value}</p>
            <p className="de-stat-label">{item.label}</p>
          </article>
        ))}
      </div>

      <div className="de-audience-grid">
        <article className="de-audience-panel">
          <p className="de-mono-label">Locataires</p>
          <h2 id="home-figures-title" className="de-display">
            Louer, simplement
          </h2>
          <p>
            Catalogue en ligne, tarifs affichés, véhicule préparé. Vous choisissez
            les dates, nous organisons la remise des clés.
          </p>
          <Link href={PUBLIC_ROUTES.vehicles} className="de-text-cta">
            Voir la collection
          </Link>
        </article>
        <article className="de-audience-panel">
          <p className="de-mono-label">Propriétaires</p>
          <h2 className="de-display">Faire travailler le vôtre</h2>
          <p>
            Revenus mensuels consultables, prise en charge totale, transparence
            sur chaque location. Vous restez propriétaire.
          </p>
          <Link href={PUBLIC_ROUTES.owners} className="de-text-cta">
            Confier mon véhicule
          </Link>
        </article>
      </div>
    </section>
  );
}
