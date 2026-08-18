const SERVICES = [
  {
    title: "Gestion des réservations",
    text: "Calendrier, disponibilités et confirmations gérés pour vous.",
  },
  {
    title: "Accueil des locataires",
    text: "Remise et restitution des clés dans les règles, avec un interlocuteur unique.",
  },
  {
    title: "Nettoyage",
    text: "Préparation et remise en état du véhicule entre chaque location.",
  },
  {
    title: "Suivi des locations",
    text: "Kilométrage, état du véhicule et suivi opérationnel de bout en bout.",
  },
  {
    title: "Accompagnement personnalisé",
    text: "Une équipe disponible pour répondre à vos questions à tout moment.",
  },
];

export default function OwnersServices() {
  return (
    <section className="de-section de-section-alt" aria-labelledby="owners-services-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <h2 id="owners-services-title" className="de-display de-section-title">
            Ce que DreamEffect prend en charge
          </h2>
          <p className="de-section-description">
            Vous conservez la propriété de votre véhicule. Nous gérons
            l&apos;exploitation au quotidien.
          </p>
        </div>

        <ol className="de-owners-text-list">
          {SERVICES.map(({ title, text }, index) => (
            <li key={title} className="de-owners-text-item">
              <p className="de-owners-text-index">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="de-owners-text-title">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed de-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
