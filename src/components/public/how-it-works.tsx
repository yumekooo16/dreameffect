import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

const POINTS = [
  {
    title: "Propriétaires",
    text: "On s'occupe des réservations, du nettoyage, de l'entretien et du suivi. Vous recevez vos revenus chaque mois, sans vous en occuper.",
  },
  {
    title: "Locataires",
    text: "Vous choisissez un véhicule, on s'occupe du reste : réservation, remise des clés, accompagnement si besoin.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="de-section">
      <div className="de-public-container">
        <div className="de-section-header">
          <h2 className="de-display de-section-title">Comment ça marche</h2>
          <p className="de-section-description">
            Deux parcours simples, un seul interlocuteur.
          </p>
        </div>

        <div className="de-process-grid">
          {POINTS.map(({ title, text }) => (
            <article key={title} className="de-process-column">
              <h3 className="de-display text-xl tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed de-muted">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={PUBLIC_ROUTES.contact}
            className="de-btn de-btn-ghost inline-flex items-center gap-2"
          >
            Une question avant de commencer ?
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
