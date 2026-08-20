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
    <section className="de-keys-section" aria-labelledby="owners-trust-title">
      <div className="de-public-container">
        <p className="de-keys-eyebrow">Confiance</p>
        <h2 id="owners-trust-title" className="de-keys-h2">
          Pourquoi nous faire confiance
        </h2>
        <ol className="de-keys-manifest">
          {TRUST_POINTS.map(({ title, text }, index) => (
            <li key={title}>
              <span className="de-keys-eyebrow">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
