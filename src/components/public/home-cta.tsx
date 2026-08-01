import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeCtaSection() {
  return (
    <section className="de-section">
      <div className="de-public-container">
        <div className="de-cta-grid">
          <Link href={PUBLIC_ROUTES.owners} className="de-cta-card">
            <p className="de-label">Propriétaires</p>
            <h2 className="de-display mt-2 text-xl tracking-tight">
              Faites travailler votre véhicule
            </h2>
            <p className="mt-2 text-sm de-muted">
              On gère la location de A à Z. Vous suivez vos revenus.
            </p>
            <span className="de-cta-link">
              En savoir plus <ArrowRight size={16} />
            </span>
          </Link>

          <Link href={PUBLIC_ROUTES.contact} className="de-cta-card">
            <p className="de-label">Contact</p>
            <h2 className="de-display mt-2 text-xl tracking-tight">
              Besoin d&apos;un renseignement ?
            </h2>
            <p className="mt-2 text-sm de-muted">
              Téléphone, email ou WhatsApp — on est joignables.
            </p>
            <span className="de-cta-link">
              Nous contacter <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
