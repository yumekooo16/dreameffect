import type { Metadata } from "next";
import PageHero from "@/src/components/public/page-hero";
import ContactContent from "@/src/components/public/contact-content";
import JsonLd from "@/src/components/public/json-ld";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  localBusinessJsonLd,
} from "@/src/lib/public/seo";
import {
  CONTACT_KEYWORDS,
  formatServiceAreaLabel,
} from "@/src/lib/public/local-seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description: `Contactez DreamEffect par téléphone, email ou WhatsApp. Location de véhicules haut de gamme à ${formatServiceAreaLabel()} et gestion locative pour propriétaires.`,
  path: PUBLIC_ROUTES.contact,
  keywords: [...CONTACT_KEYWORDS],
});

export default async function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Contact", path: PUBLIC_ROUTES.contact },
          ]),
          localBusinessJsonLd(),
        ]}
      />
      <PageHero
        eyebrow="Échange"
        title="Contact"
        description="Une question sur une location, ou sur la gestion de votre véhicule ? WhatsApp le jour même, formulaire sous 24 h."
      />
      <ContactContent />
    </>
  );
}
