import { CONTACT_EMAIL, CONTACT_PHONE } from "@/src/lib/public/contact";
import { SITE_URL } from "@/src/lib/public/site";

/** Contenu flyer BMW Série 2 — aligné visuel fourni. */
export const BMW_SERIE2_FLYER = {
  slug: "bmw-serie-2",
  heroImage: "/flyers/bmw-serie-2.jpg",
  vehicleUrl: `${SITE_URL}/vehicules/bmw-serie-2-gran-coupe`,
  brandLine: "BMW",
  modelLine: "SÉRIE 2",
  specs: [
    { label: "MARQUE", value: "BMW" },
    { label: "COULEUR", value: "GRIS" },
    { label: "MOTORISATION", value: "136-CH" },
    { label: "KILOMÉTRAGE INCLUS", value: "200/KM" },
    { label: "KM SUPPLÉMENTAIRE", value: "1,50€" },
  ],
  pricing: [
    { label: "24H (LUNDI-JEUDI)", value: "120€" },
    { label: "24H WEEK-END", value: "250€" },
    { label: "48H WEEK-END", value: "350€" },
    { label: "72H WEEK-END", value: "420€" },
    { label: "SEMAINE (7 JOURS)", value: "650€" },
  ],
  deposit: "2 000€",
  requirements:
    "PERMIS • PIÈCE D'IDENTITÉ VALIDE • JUSTIFICATIF DE DOMICILE - 3 MOIS",
  contacts: [
    { kind: "email" as const, label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { kind: "instagram" as const, label: "_dreameffect", href: "https://instagram.com/_dreameffect" },
    { kind: "snapchat" as const, label: "dreameffect.fr", href: "https://www.snapchat.com/add/dreameffect.fr" },
    { kind: "whatsapp" as const, label: CONTACT_PHONE.replace(/\s/g, ""), href: "https://wa.me/33616320381" },
  ],
  tagline: "L'effet d'un rêve devenu réalité.",
};
