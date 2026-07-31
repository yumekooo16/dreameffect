import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import OwnerForm from "@/src/components/admin/owner-form";

export default async function NewOwnerPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/proprietaires"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Retour aux propriétaires
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Nouveau propriétaire
        </h1>
        <p className="mt-1 text-sm de-muted">
          Créer un compte d&apos;accès à l&apos;espace propriétaire
        </p>
      </div>

      <Section title="Informations du compte">
        <OwnerForm cancelHref="/admin/proprietaires" />
      </Section>
    </div>
  );
}
