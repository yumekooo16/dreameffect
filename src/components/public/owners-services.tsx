const SERVICES = [
  {
    title: "Les réservations",
    text: "Calendrier, disponibilités et confirmations, gérés pour vous.",
  },
  {
    title: "L'accueil des locataires",
    text: "Remise et restitution des clés, avec un interlocuteur unique.",
  },
  {
    title: "La préparation",
    text: "Nettoyage et remise en état du véhicule entre chaque location.",
  },
  {
    title: "Le suivi",
    text: "Kilométrage, état du véhicule et historique de chaque séjour.",
  },
  {
    title: "L'accompagnement",
    text: "Une équipe disponible, pour vous comme pour les locataires.",
  },
];

export default function OwnersServices() {
  return (
    <section className="de-section de-section-alt" aria-labelledby="owners-services-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <p className="de-section-eyebrow">Prestations</p>
          <h2 id="owners-services-title" className="de-display de-section-title">
            Ce que nous prenons en charge
          </h2>
          <p className="de-section-description">
            Vous restez propriétaire. Nous assurons l&apos;exploitation au
            quotidien.
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
