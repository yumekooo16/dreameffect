const STEPS = [
  {
    step: "01",
    title: "Vous nous confiez votre véhicule",
    text: "On échange sur votre modèle, vos attentes et les conditions de mise en location.",
  },
  {
    step: "02",
    title: "Nous créons son annonce et trouvons les locataires",
    text: "Photos, présentation, tarifs et diffusion sur notre catalogue — nous attirons les bons profils.",
  },
  {
    step: "03",
    title: "Nous gérons l'opérationnel",
    text: "Réservations, remise des clés, nettoyage et suivi de chaque location : tout est pris en charge.",
  },
  {
    step: "04",
    title: "Vous percevez vos revenus",
    text: "Chaque mois, vous consultez vos revenus et l'activité de votre véhicule en toute transparence.",
  },
];

export default function OwnersHowItWorks() {
  return (
    <section className="de-section de-process" aria-labelledby="owners-how-title">
      <div className="de-public-container">
        <div className="de-section-masthead">
          <p className="de-section-eyebrow">Parcours</p>
          <h2 id="owners-how-title" className="de-display de-section-title">
            Comment ça fonctionne
          </h2>
          <p className="de-section-lede">
            Quatre temps pour mettre votre véhicule en location, sans charge
            opérationnelle.
          </p>
        </div>

        <div className="de-timeline de-timeline--four">
          {STEPS.map(({ step, title, text }) => (
            <article key={step} className="de-timeline-step">
              <span className="de-timeline-index" aria-hidden>
                {step}
              </span>
              <h3 className="de-display de-timeline-title">{title}</h3>
              <p className="de-timeline-text">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
