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
    title: "Espace propriétaire",
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
      <div className="de-public-container de-essay-split">
        <div>
          <p className="de-section-eyebrow">Confiance</p>
          <h2 id="owners-trust-title" className="de-display de-section-title">
            Pourquoi nous faire confiance
          </h2>
        </div>
        <ol className="de-essay-list">
          {TRUST_POINTS.map(({ title, text }) => (
            <li key={title}>
              <h3 className="de-display">{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
