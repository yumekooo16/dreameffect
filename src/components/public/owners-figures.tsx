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
    <div className="de-stats-band" style={{ marginTop: "2.5rem", borderTop: "1px solid var(--line)" }} aria-label="Repères propriétaires">
      {FIGURES.map((item) => (
        <article key={item.value} className="de-stat-cell">
          <p className="de-stat-value de-display">{item.value}</p>
          <p className="de-stat-label">{item.label}</p>
        </article>
      ))}
    </div>
  );
}
