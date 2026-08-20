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
    <div className="de-keys-figures" aria-label="Repères propriétaires">
      {FIGURES.map((item) => (
        <article key={item.value} className="de-keys-figure">
          <p className="de-keys-figure-value">{item.value}</p>
          <p className="de-keys-figure-label">{item.label}</p>
        </article>
      ))}
    </div>
  );
}
