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
      <div className="de-public-container">
        <header className="de-exhibit-head">
          <p className="de-exhibit-head-num" aria-hidden>
            03
          </p>
          <div>
            <p className="de-mono-label">Confiance</p>
            <h2 id="owners-trust-title" className="de-display de-exhibit-head-title">
              Pourquoi nous faire confiance
            </h2>
          </div>
        </header>

        <ol className="de-manifest-list">
          {TRUST_POINTS.map(({ title, text }, index) => (
            <li key={title}>
              <span className="de-mono-label">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="de-display">{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
