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
    <section className="de-section" aria-labelledby="owners-how-title">
      <div className="de-public-container">
        <header className="de-exhibit-head">
          <p className="de-exhibit-head-num" aria-hidden>
            01
          </p>
          <div>
            <p className="de-mono-label">Parcours</p>
            <h2 id="owners-how-title" className="de-display de-exhibit-head-title">
              Comment ça fonctionne
            </h2>
          </div>
          <p className="de-exhibit-head-lede">
            Quatre temps pour mettre votre véhicule en location, sans charge
            opérationnelle.
          </p>
        </header>

        <ol className="de-manifest-list">
          {STEPS.map(({ step, title, text }) => (
            <li key={step}>
              <span className="de-mono-label">{step}</span>
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
