import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import Section from "@/src/components/owner/section";
import { WHATSAPP_URL } from "@/src/lib/constants";

export default async function ProfilePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", user.id)
    .single();

  const fields = [
    { label: "Prénom", value: profile?.first_name },
    { label: "Nom", value: profile?.last_name },
    { label: "Téléphone", value: profile?.phone },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href="/espace-proprietaire"
        className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
      >
        ← Retour au tableau de bord
      </Link>

      <div>
        <h1 className="de-display text-2xl sm:text-3xl tracking-tight">Mon profil</h1>
        <p className="mt-1 text-sm de-muted">
          Vos informations de contact DreamEffect
        </p>
      </div>

      <Section title="Informations">
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.label} className="de-card-inner">
              <p className="de-label">{field.label}</p>
              <p className="mt-1 font-medium">
                {field.value?.trim() || "Non renseigné"}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs de-muted">
          Pour toute modification, contactez l&apos;équipe DreamEffect.
        </p>
      </Section>

      <div className="de-card de-card-padded">
        <p className="de-label">Besoin d&apos;aide ?</p>
        <p className="mt-2 text-sm de-muted">
          Notre équipe de conciergerie est disponible pour répondre à toutes vos
          questions concernant votre véhicule.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="de-btn de-btn-primary mt-4 inline-flex w-full sm:w-auto"
        >
          Contacter DreamEffect
        </a>
      </div>
    </div>
  );
}
