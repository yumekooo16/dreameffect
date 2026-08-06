import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import ContactSubmissionsList from "@/src/components/admin/contact-submissions-list";
import { fetchContactSubmissions } from "@/src/lib/admin/contacts-data";

export default async function AdminContactsPage() {
  await requireAdmin();
  const items = await fetchContactSubmissions();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Tableau de bord
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Demandes de contact
        </h1>
        <p className="mt-1 text-sm de-muted">
          Coordonnées enregistrées depuis le formulaire du site public
        </p>
      </div>

      <Section title={`${items.length} demande${items.length > 1 ? "s" : ""}`}>
        <ContactSubmissionsList items={items} />
      </Section>
    </div>
  );
}
