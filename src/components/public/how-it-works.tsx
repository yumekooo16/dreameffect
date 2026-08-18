import Link from "next/link";
import { HOME_PROCESS_STEPS } from "@/src/lib/public/home-content";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

const STEP_LINKS = [
  { href: PUBLIC_ROUTES.vehicles, label: "Voir la flotte" },
  { href: PUBLIC_ROUTES.contact, label: "Organiser une remise" },
  { href: PUBLIC_ROUTES.owners, label: "Confier mon véhicule" },
] as const;

export default function HowItWorksSection() {
  return (
    <section className="de-pillars" aria-labelledby="home-process-title">
      <h2 id="home-process-title" className="sr-only">
        Comment ça marche
      </h2>
      <div className="de-pillars-grid">
        {HOME_PROCESS_STEPS.map(({ step, title, text }, index) => {
          const link = STEP_LINKS[index];

          return (
            <article key={step} className="de-pillar">
              <span className="de-pillar-index">{step}</span>
              <div>
                <h3 className="de-pillar-title">{title}</h3>
                <p className="de-pillar-text">{text}</p>
              </div>
              <Link href={link.href} className="de-text-link">
                {link.label}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
