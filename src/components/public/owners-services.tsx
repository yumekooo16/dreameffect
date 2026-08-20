const SERVICES = [
  {
    title: "Gestion des réservations",
    text: "Calendrier, disponibilités et confirmations gérés pour vous.",
  },
  {
    title: "Accueil des locataires",
    text: "Remise et restitution des clés, avec un interlocuteur unique.",
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
    title: "Accompagnement",
    text: "Une équipe disponible pour répondre à vos questions à tout moment.",
  },
];

export default function OwnersServices() {
  return (
    <section className="de-keys-section de-keys-section--paper" aria-labelledby="owners-services-title">
      <div className="de-public-container">
        <p className="de-keys-eyebrow">Prise en charge</p>
        <h2 id="owners-services-title" className="de-keys-h2">
          Ce que nous gérons
        </h2>
        <p className="de-keys-lede">
          Vous conservez la propriété. Nous opérons au quotidien.
        </p>
        <ol className="de-keys-manifest">
          {SERVICES.map(({ title, text }, index) => (
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
