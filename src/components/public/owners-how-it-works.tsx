const STEPS = [
  {
    step: "01",
    title: "Vous nous confiez le véhicule",
    text: "Nous échangeons sur le modèle, vos attentes et les conditions de mise en location.",
  },
  {
    step: "02",
    title: "Nous créons l'annonce",
    text: "Photos, présentation, tarifs et diffusion sur le catalogue — pour attirer les profils adaptés.",
  },
  {
    step: "03",
    title: "Nous gérons l'exploitation",
    text: "Réservations, remise des clés, préparation et suivi de chaque location : tout est pris en charge.",
  },
  {
    step: "04",
    title: "Vous percevez vos revenus",
    text: "Chaque mois, l'activité et les revenus de votre véhicule sont consultables, en toute clarté.",
  },
];

export default function OwnersHowItWorks() {
  return (
    <section className="de-section" aria-labelledby="owners-how-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <p className="de-section-eyebrow">Parcours</p>
          <h2 id="owners-how-title" className="de-display de-section-title">
            Le déroulement
          </h2>
          <p className="de-section-description">
            Quatre temps, sans charge opérationnelle de votre côté.
          </p>
        </div>

        <div className="de-owners-steps-grid">
          {STEPS.map(({ step, title, text }) => (
            <article key={step} className="de-step-card">
              <span className="de-step-number">{step}</span>
              <h3 className="de-display mt-4 text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed de-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
