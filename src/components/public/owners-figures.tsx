const FIGURES = [
  {
    value: "24 h",
    label: "Réponse moyenne pour étudier votre projet de mise en location.",
  },
  {
    value: "0 charge",
    label: "opérationnelle au quotidien : réservations, clés, nettoyage, suivi.",
  },
  {
    value: "Mensuel",
    label: "Revenus et activité consultables depuis votre espace propriétaire.",
  },
];

export default function OwnersFigures() {
  return (
    <div className="de-figures de-owners-figures" aria-label="Repères propriétaires">
      {FIGURES.map((item) => (
        <article key={item.value} className="de-figure">
          <p className="de-figure-value de-display">{item.value}</p>
          <p className="de-figure-label">{item.label}</p>
        </article>
      ))}
    </div>
  );
}
