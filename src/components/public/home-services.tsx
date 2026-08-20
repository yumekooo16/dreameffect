import Link from "next/link";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

const SERVICES = [
  {
    index: "01",
    label: "Location prestige",
    title: "Louer un véhicule haut de gamme",
    text: "Berlines, SUV et sportives entretenues aux standards exigeants, préparées avant chaque remise des clés.",
    href: PUBLIC_ROUTES.vehicles,
    cta: "Voir la flotte",
  },
  {
    index: "02",
    label: "Gestion propriétaires",
    title: "Faire travailler le vôtre",
    text: "Réservations, accueil, nettoyage et suivi — vous percevez vos revenus, nous opérons au quotidien.",
    href: PUBLIC_ROUTES.owners,
    cta: "Confier mon véhicule",
  },
  {
    index: "03",
    label: "Conciergerie",
    title: "Un interlocuteur unique",
    text: "Remise des clés à Beauvais, Gisors ou sur rendez-vous. Réponse rapide par WhatsApp ou téléphone.",
    href: PUBLIC_ROUTES.contact,
    cta: "Nous contacter",
  },
];

export default function HomeServicesSection() {
  return (
    <section className="de-motion-services" aria-labelledby="home-services-title">
      <div className="de-public-container">
        <p className="de-motion-eyebrow">Prestations</p>
        <h2 id="home-services-title" className="de-motion-section-title">
          Ce que nous proposons
        </h2>
      </div>

      <div className="de-motion-services-grid">
        {SERVICES.map(({ index, label, title, text, href, cta }) => (
          <article key={index} className="de-motion-service">
            <span className="de-motion-service-index">{index}</span>
            <p className="de-motion-service-label">{label}</p>
            <h3 className="de-motion-service-title">{title}</h3>
            <p className="de-motion-service-text">{text}</p>
            <Link href={href} className="de-motion-service-link">
              {cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
