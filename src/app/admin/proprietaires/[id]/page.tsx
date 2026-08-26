import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/lib/admin/auth";
import { fetchOwnerDetail } from "@/src/lib/admin/owners-data";
import { buildWhatsAppUrl } from "@/src/lib/constants";
import Section from "@/src/components/owner/section";
import OwnerVehiclesGrid from "@/src/components/admin/owner-vehicles";
import OwnerReservationsList from "@/src/components/admin/owner-reservations";
import OwnerRevenueSection from "@/src/components/admin/owner-revenue";
import OwnerProfileForm from "@/src/components/admin/owner-profile-form";
import OwnerAccountActions from "@/src/components/admin/owner-account-actions";
import OwnerDeleteButton from "@/src/components/admin/owner-delete-button";

function ownerName(firstName?: string | null, lastName?: string | null) {
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return name || "Propriétaire";
}

export default async function AdminOwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const data = await fetchOwnerDetail(id);

  if (!data) {
    notFound();
  }

  const { owner, vehicles, reservations, revenue, isActive, emailConfirmed } =
    data;
  const whatsappUrl = owner.phone
    ? buildWhatsAppUrl(
        owner.phone,
        `Bonjour ${owner.first_name ?? ""}, l'équipe DreamEffect souhaite vous contacter.`
      )
    : null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/proprietaires"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour aux propriétaires
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
              {ownerName(owner.first_name, owner.last_name)}
            </h1>
            <p className="mt-1 text-sm de-muted">Fiche propriétaire</p>
            {owner.email && (
              <a
                href={`mailto:${owner.email}`}
                className="mt-1 inline-block text-sm text-[var(--blue-soft)] hover:underline"
              >
                {owner.email}
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`de-badge ${isActive ? "de-badge--available" : "de-badge--unavailable"}`}
            >
              {isActive ? "Compte actif" : "Compte désactivé"}
            </span>
            <span
              className={`de-badge ${emailConfirmed ? "de-badge--available" : "de-badge--unavailable"}`}
            >
              {emailConfirmed ? "Email vérifié" : "Email à vérifier"}
            </span>
          </div>
        </div>
      </div>

      <Section title="Informations">
        <OwnerProfileForm
          ownerId={owner.id}
          firstName={owner.first_name ?? ""}
          lastName={owner.last_name ?? ""}
          phone={owner.phone ?? ""}
          createdAt={owner.created_at}
          role={owner.role}
          revenueMode={owner.revenue_mode ?? "percentage"}
          ownerRevenueShare={owner.owner_revenue_share ?? 0.6}
        />
      </Section>

      <Section title="Contact">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div>
              <p className="de-label">Email</p>
              <p className="mt-1 text-lg font-medium">
                {owner.email ? (
                  <a
                    href={`mailto:${owner.email}`}
                    className="text-[var(--blue-soft)] hover:underline"
                  >
                    {owner.email}
                  </a>
                ) : (
                  "Non renseigné"
                )}
              </p>
            </div>
            <div>
              <p className="de-label">Téléphone</p>
              <p className="mt-1 text-lg font-medium">
                {owner.phone?.trim() || "Non renseigné — complétez ci-dessus"}
              </p>
            </div>
          </div>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="de-btn de-btn-primary inline-flex w-full sm:w-auto"
            >
              Contacter via WhatsApp
            </a>
          ) : (
            <p className="text-sm de-muted">
              Enregistrez un numéro de téléphone pour activer le contact WhatsApp.
            </p>
          )}
        </div>
      </Section>

      <Section title="Véhicules">
        <OwnerVehiclesGrid vehicles={vehicles} />
      </Section>

      <Section title="Réservations">
        <OwnerReservationsList reservations={reservations} />
      </Section>

      <Section title="Revenus">
        <OwnerRevenueSection revenue={revenue} />
      </Section>

      <Section title="Compte">
        <OwnerAccountActions
          ownerId={owner.id}
          isActive={isActive}
          emailConfirmed={emailConfirmed}
          email={owner.email}
        />
        <OwnerDeleteButton
          ownerId={owner.id}
          ownerName={ownerName(owner.first_name, owner.last_name)}
          vehicleCount={vehicles.length}
          reservationCount={reservations.length}
          redirectToList
        />
      </Section>
    </div>
  );
}
