const TRUST_POINTS = [
  {
    title: "Transparence",
    text: "Revenus, activité et suivi accessibles à tout moment — sans zone d'ombre.",
  },
  {
    title: "Suivi complet",
    text: "Chaque location est tracée : dates, kilométrage, entretien et historique.",
  },
  {
    title: "Interface propriétaire",
    text: "Un espace dédié pour suivre votre véhicule et vos performances.",
  },
  {
    title: "Revenus consultables",
    text: "Visualisez vos gains mois par mois, clairement et simplement.",
  },
  {
    title: "Équipe disponible",
    text: "Des interlocuteurs réactifs pour les locataires comme pour vous.",
  },
  {
    title: "Accompagnement",
    text: "De la mise en location au suivi mensuel, nous restons à vos côtés.",
  },
];

export default function OwnersTrust() {
  return (
    <section className="de-section" aria-labelledby="owners-trust-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <h2 id="owners-trust-title" className="de-display de-section-title">
            Pourquoi nous faire confiance
          </h2>
          <p className="de-section-description">
            DreamEffect a été conçu pour les propriétaires exigeants qui veulent
            des résultats sans compromis sur la qualité.
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
