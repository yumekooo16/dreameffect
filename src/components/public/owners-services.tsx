import {
  CalendarCheck,
  Sparkles,
  CarFront,
  Route,
  Headphones,
} from "lucide-react";

const SERVICES = [
  {
    icon: CalendarCheck,
    title: "Gestion des réservations",
    text: "Calendrier, disponibilités et confirmations gérés pour vous.",
  },
  {
    icon: CarFront,
    title: "Accueil des locataires",
    text: "Remise et restitution des clés dans les règles, avec un interlocuteur unique.",
  },
  {
    icon: Sparkles,
    title: "Nettoyage",
    text: "Préparation et remise en état du véhicule entre chaque location.",
  },
  {
    icon: Route,
    title: "Suivi des locations",
    text: "Kilométrage, état du véhicule et suivi opérationnel de bout en bout.",
  },
  {
    icon: Headphones,
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

        <div className="de-owners-services-grid">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="de-owners-service-card">
              <div className="de-owners-service-icon" aria-hidden>
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="de-display mt-4 text-base tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed de-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
