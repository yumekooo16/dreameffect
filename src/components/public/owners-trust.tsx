import {
  ShieldCheck,
  LayoutDashboard,
  Wallet,
  Users,
  Eye,
  HeartHandshake,
} from "lucide-react";

const TRUST_POINTS = [
  {
    icon: Eye,
    title: "Transparence",
    text: "Revenus, activité et suivi accessibles à tout moment — sans zone d'ombre.",
  },
  {
    icon: ShieldCheck,
    title: "Suivi complet",
    text: "Chaque location est tracée : dates, kilométrage, entretien et historique.",
  },
  {
    icon: LayoutDashboard,
    title: "Interface propriétaire",
    text: "Un espace dédié pour suivre votre véhicule et vos performances.",
  },
  {
    icon: Wallet,
    title: "Revenus consultables",
    text: "Visualisez vos gains mois par mois, clairement et simplement.",
  },
  {
    icon: Users,
    title: "Équipe disponible",
    text: "Des interlocuteurs réactifs pour les locataires comme pour vous.",
  },
  {
    icon: HeartHandshake,
    title: "Accompagnement",
    text: "De la mise en location au suivi mensuel, nous restons à vos côtés.",
  },
];

export default function OwnersTrust() {
  return (
    <section className="de-section" aria-labelledby="owners-trust-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <h2 id="owners-trust-title" className="de-display de-section-title">
            Pourquoi nous faire confiance
          </h2>
          <p className="de-section-description">
            DreamEffect a été conçu pour les propriétaires exigeants qui veulent
            des résultats sans compromis sur la qualité.
          </p>
        </div>

        <div className="de-owners-trust-grid">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <article key={title} className="de-owners-trust-card">
              <div className="de-owners-trust-icon" aria-hidden>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <h3 className="de-display mt-3 text-base tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed de-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
