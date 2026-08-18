import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeOwnersBand() {
  return (
    <section className="de-section de-owners-band" aria-labelledby="home-owners-title">
      <div className="de-public-container">
        <div className="de-owners-band-panel">
          <div>
            <p className="de-section-eyebrow">Propriétaires</p>
            <h2 id="home-owners-title" className="de-display de-section-title">
              Votre véhicule peut travailler pour vous.
            </h2>
            <p className="de-section-description">
              Réservations, clés, préparation et suivi : nous prenons
              l&apos;exploitation. Vous consultez vos revenus chaque mois.
            </p>
          </div>
          <Link
            href={PUBLIC_ROUTES.owners}
            className="de-btn de-btn-primary shrink-0 self-start"
          >
            Espace propriétaires
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
