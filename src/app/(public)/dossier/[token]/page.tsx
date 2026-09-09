import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/src/components/public/page-hero";
import DossierUploadForm from "@/src/components/public/dossier-upload-form";
import { fetchDossierContextByToken } from "@/src/lib/admin/reservation-docs-data";
import { SITE_NAME } from "@/src/lib/public/site";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  return {
    title: `Dépôt de documents | ${SITE_NAME}`,
    description: "Déposez vos documents pour finaliser votre demande de location DreamEffect.",
    robots: { index: false, follow: false },
    alternates: { canonical: `/dossier/${token}` },
  };
}

export default async function DossierPage({ params }: PageProps) {
  const { token } = await params;
  const context = await fetchDossierContextByToken(token);

  if (!context) {
    notFound();
  }

  const startLabel = new Date(context.startDate).toLocaleDateString("fr-FR");
  const endLabel = new Date(context.endDate).toLocaleDateString("fr-FR");

  return (
    <>
      <PageHero
        title="Déposez vos documents"
        description="Lien sécurisé DreamEffect — pièce d'identité, permis et justificatif de domicile."
      />
      <section className="de-section de-section-compact">
        <div className="de-public-container de-dossier-page">
          <div className="de-dossier-summary">
            <p className="de-label">Votre demande</p>
            <h2 className="de-display de-dossier-vehicle">{context.vehicleLabel}</h2>
            <p className="de-dossier-meta">
              {context.customerName ? `${context.customerName} · ` : ""}
              {startLabel} → {endLabel}
            </p>
            <p className="de-dossier-expiry">
              Lien valable jusqu&apos;au{" "}
              {new Date(context.expiresAt).toLocaleString("fr-FR")}
            </p>
          </div>

          <DossierUploadForm
            token={token}
            uploadedTypes={context.uploadedTypes}
          />
        </div>
      </section>
    </>
  );
}
