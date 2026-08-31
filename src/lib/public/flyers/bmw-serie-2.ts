import { CONTACT_EMAIL, CONTACT_PHONE } from "@/src/lib/public/contact";
import { SITE_URL } from "@/src/lib/public/site";

/** Contenu flyer BMW Série 2 — aligné catalogue + visuel fourni. */
export const BMW_SERIE2_FLYER = {
  slug: "bmw-serie-2",
  heroImage: "/flyers/bmw-serie-2.jpg",
  vehicleUrl: `${SITE_URL}/vehicules/bmw-serie-2-gran-coupe`,
  brandLine: "BMW",
  modelLine: "SÉRIE 2",
  specs: [
    { label: "Marque", value: "BMW" },
    { label: "Couleur", value: "Gris" },
    { label: "Motorisation", value: "136 ch" },
    { label: "Kilométrage inclus", value: "200 km" },
    { label: "Km supplémentaire", value: "1,50 €" },
  ],
  pricing: [
    { label: "24 h (lundi–jeudi)", value: "120 €" },
    { label: "24 h week-end", value: "250 €" },
    { label: "48 h week-end", value: "350 €" },
    { label: "72 h week-end", value: "420 €" },
    { label: "Semaine (7 jours)", value: "650 €" },
  ],
  deposit: "2 000 €",
  requirements:
    "Permis · Pièce d'identité valide · Justificatif de domicile (- 3 mois)",
  contacts: [
    { kind: "email" as const, label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { kind: "instagram" as const, label: "_dreameffect", href: "https://instagram.com/_dreameffect" },
    { kind: "snapchat" as const, label: "dreameffect.fr", href: "https://www.snapchat.com/add/dreameffect.fr" },
    { kind: "whatsapp" as const, label: CONTACT_PHONE.replace(/\s/g, ""), href: "https://wa.me/33616320381" },
  ],
  tagline: "L'effet d'un rêve devenu réalité.",
};
