const TRUST_POINTS = [
  {
    title: "Transparence",
    text: "Revenus, activité et suivi, accessibles à tout moment.",
  },
  {
    title: "Traçabilité",
    text: "Chaque location est documentée : dates, kilométrage, entretien.",
  },
  {
    title: "Espace propriétaire",
    text: "Un espace dédié pour suivre votre véhicule et vos performances.",
  },
  {
    title: "Revenus lisibles",
    text: "Vos gains, mois par mois, sans zone d'ombre.",
  },
  {
    title: "Disponibilité",
    text: "Des interlocuteurs réactifs, pour les locataires comme pour vous.",
  },
  {
    title: "Continuité",
    text: "De la mise en location au suivi mensuel, nous restons à vos côtés.",
  },
];

export default function OwnersTrust() {
  return (
    <section className="de-section" aria-labelledby="owners-trust-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <h2 id="owners-trust-title" className="de-display de-section-title">
            Ce qui nous distingue
          </h2>
          <p className="de-section-description">
            Une gestion exigeante, lisible, et un interlocuteur unique.
          </p>
        </div>

        <div className="de-owners-text-columns">
          {TRUST_POINTS.map(({ title, text }) => (
            <article key={title} className="de-owners-text-block">
              <h3 className="de-owners-text-title">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed de-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
