import Link from "next/link";
import Image from "next/image";
import VehicleStatusBadge from "@/src/components/vehicle-status-badge";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import {
  COMPANY_REVENUE_SHARE_PERCENT,
  OWNER_REVENUE_SHARE_PERCENT,
} from "@/src/lib/revenue/split";

type NextReservation = {
  start_date: string;
  end_date: string;
} | null;

type VehicleHeroProps = {
  ownerName: string;
  brand: string;
  model: string;
  version?: string | null;
  year?: number | null;
  status: string;
  vehicleId: string;
  heroImageUrl?: string | null;
  fallbackImageUrl?: string | null;
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
  monthlyRevenue: number;
  reservationCount: number;
  nextReservation: NextReservation;
  fleetCount?: number;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

function formatEuro(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

export default function VehicleHero({
  ownerName,
  brand,
  model,
  version,
  year,
  status,
  vehicleId,
  heroImageUrl,
  fallbackImageUrl,
  totalRevenue,
  ownerShare,
  companyShare,
  monthlyRevenue,
  reservationCount,
  nextReservation,
  fleetCount = 1,
}: VehicleHeroProps) {
  const imageSrc =
    resolveVehicleImageUrl(heroImageUrl) ??
    resolveVehicleImageUrl(fallbackImageUrl);
  const displayModel = [model, version?.trim()].filter(Boolean).join(" ");

  return (
    <section className="de-vehicle-hero" aria-labelledby="owner-vehicle-hero-title">
      <div className="de-vehicle-hero__backdrop" aria-hidden />

      <div className="de-vehicle-hero__layout">
        <div className="de-vehicle-hero__intro">
          <p className="de-vehicle-hero__eyebrow">Espace propriétaire</p>
          <h1 id="owner-vehicle-hero-title" className="de-display de-vehicle-hero__welcome">
            Bonjour {ownerName}
          </h1>
          <p className="de-vehicle-hero__subtitle">
            {fleetCount > 1
              ? "Votre véhicule principal et ses performances DreamEffect"
              : "Votre véhicule et ses performances DreamEffect"}
          </p>

          <div className="de-vehicle-hero__meta">
            <p className="de-vehicle-hero__brand">{brand}</p>
            <p className="de-display de-vehicle-hero__model">{displayModel}</p>
            {year && <p className="de-vehicle-hero__year">{year}</p>}
            <div className="de-vehicle-hero__status">
              <VehicleStatusBadge status={status} />
            </div>
          </div>

          <Link
            href={`/espace-proprietaire/vehicule/${vehicleId}`}
            className="de-btn de-btn-ghost de-vehicle-hero__link"
          >
            Voir la fiche complète →
          </Link>
        </div>

        <div className="de-vehicle-hero__visual">
          <div className="de-vehicle-hero__shadow" aria-hidden />

          <div className="de-vehicle-hero__car-wrap">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={`${brand} ${displayModel}`}
                width={920}
                height={460}
                priority
                className="de-vehicle-hero__car"
                sizes="(max-width: 768px) 85vw, 560px"
              />
            ) : (
              <div className="de-vehicle-hero__placeholder">
                <span>Image premium à venir</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="de-vehicle-hero__stats">
        <div className="de-vehicle-hero__stat">
          <p className="de-label">Réservations</p>
          <p className="de-vehicle-hero__stat-value">{reservationCount}</p>
        </div>
        <div className="de-vehicle-hero__stat">
          <p className="de-label">Chiffre d&apos;affaires total</p>
          <p className="de-vehicle-hero__stat-value">{formatEuro(totalRevenue)}</p>
        </div>
        <div className="de-vehicle-hero__stat de-vehicle-hero__stat--highlight">
          <p className="de-label">Votre part ({OWNER_REVENUE_SHARE_PERCENT}&nbsp;%)</p>
          <p className="de-vehicle-hero__stat-value">{formatEuro(ownerShare)}</p>
        </div>
        <div className="de-vehicle-hero__stat">
          <p className="de-label">DreamEffect ({COMPANY_REVENUE_SHARE_PERCENT}&nbsp;%)</p>
          <p className="de-vehicle-hero__stat-value">{formatEuro(companyShare)}</p>
        </div>
        <div className="de-vehicle-hero__stat">
          <p className="de-label">Votre mois en cours</p>
          <p className="de-vehicle-hero__stat-value">{formatEuro(monthlyRevenue)}</p>
        </div>
        <div className="de-vehicle-hero__stat">
          <p className="de-label">Prochaine réservation</p>
          {nextReservation ? (
            <>
              <p className="de-vehicle-hero__stat-value de-vehicle-hero__stat-value--sm">
                {formatDate(nextReservation.start_date)}
              </p>
              <p className="mt-0.5 text-xs de-muted">
                → {formatDate(nextReservation.end_date)}
              </p>
            </>
          ) : (
            <p className="de-vehicle-hero__stat-value de-vehicle-hero__stat-value--sm de-muted">
              Aucune
            </p>
          )}
        </div>
        <div className="de-vehicle-hero__stat">
          <p className="de-label">Statut</p>
          <div className="mt-1">
            <VehicleStatusBadge status={status} />
          </div>
        </div>
      </div>
    </section>
  );
}
