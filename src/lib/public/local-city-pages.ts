import type { InfoBlock } from "@/src/lib/public/info-content";

export type LocalCitySlug =
  | "conciergerie-automobile-beauvais"
  | "conciergerie-automobile-gisors"
  | "agence-location-vehicule-beauvais"
  | "agence-location-vehicule-gisors";

export type LocalCityPage = {
  slug: LocalCitySlug;
  city: "Beauvais" | "Gisors";
  kind: "conciergerie" | "location";
  path: `/${LocalCitySlug}`;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  blocks: InfoBlock[];
  ctaTitle: string;
  ctaBody: string;
  related: { label: string; href: string }[];
};

export const LOCAL_CITY_PAGES: Record<LocalCitySlug, LocalCityPage> = {
  "conciergerie-automobile-beauvais": {
    slug: "conciergerie-automobile-beauvais",
    city: "Beauvais",
    kind: "conciergerie",
    path: "/conciergerie-automobile-beauvais",
    metaTitle: "Conciergerie automobile à Beauvais",
    metaDescription:
      "Conciergerie automobile à Beauvais (Oise) : DreamEffect gère location, entretien et suivi de votre véhicule. Mandat clair, équipe locale.",
    keywords: [
      "conciergerie automobile Beauvais",
      "conciergerie Beauvais",
      "gestion locative voiture Beauvais",
      "conciergerie auto Oise",
      "DreamEffect",
    ],
    heroEyebrow: "Beauvais · Oise",
    heroTitle: "Conciergerie automobile à Beauvais",
    heroDescription:
      "Confiez votre véhicule : mise en location, entretien et suivi — sans charge mentale au quotidien.",
    blocks: [
      {
        title: "Une conciergerie auto près de Beauvais",
        paragraphs: [
          "Vous cherchez une conciergerie automobile à Beauvais ? DreamEffect prend en charge la mise en location, l’entretien et le suivi de votre véhicule, avec une équipe locale basée en Oise.",
          "Nous intervenons à Beauvais et alentours (Tillé, Allonne, communes voisines) pour les propriétaires qui veulent monétiser un véhicule sans gérer annonces, clés ni entretien au quotidien.",
        ],
      },
      {
        title: "Ce que nous gérons pour vous",
        paragraphs: [
          "Vous restez propriétaire ; nous assurons l’opérationnel selon le mandat convenu.",
        ],
        bullets: [
          "Mise en ligne et calendrier de réservation",
          "Remises et reprises des clés",
          "Entretien courant et préparation véhicule",
          "Reporting et versement des revenus",
        ],
      },
      {
        title: "Pourquoi un interlocuteur local ?",
        paragraphs: [
          "Une conciergerie automobile à Beauvais, c’est la réactivité d’une équipe joignable (WhatsApp / téléphone) et une connaissance du terrain Oise — pas un call center distant.",
        ],
      },
    ],
    ctaTitle: "Parler de votre véhicule",
    ctaBody:
      "Décrivez votre modèle : nous revenons vers vous avec les prochaines étapes de mise en gestion.",
    related: [
      { label: "Agence de location Beauvais", href: "/agence-location-vehicule-beauvais" },
      { label: "Conciergerie Gisors", href: "/conciergerie-automobile-gisors" },
      { label: "Espace propriétaires", href: "/proprietaires" },
    ],
  },
  "conciergerie-automobile-gisors": {
    slug: "conciergerie-automobile-gisors",
    city: "Gisors",
    kind: "conciergerie",
    path: "/conciergerie-automobile-gisors",
    metaTitle: "Conciergerie automobile à Gisors",
    metaDescription:
      "Conciergerie automobile à Gisors (Eure / Vexin) : DreamEffect gère location, entretien et suivi. Interlocuteur local, mandat clair.",
    keywords: [
      "conciergerie automobile Gisors",
      "conciergerie Gisors",
      "gestion locative voiture Gisors",
      "conciergerie auto Vexin",
      "DreamEffect",
    ],
    heroEyebrow: "Gisors · Vexin",
    heroTitle: "Conciergerie automobile à Gisors",
    heroDescription:
      "Gestion locative et entretien de votre véhicule, avec une présence locale entre l’Eure et l’Oise.",
    blocks: [
      {
        title: "Une conciergerie auto à Gisors",
        paragraphs: [
          "Vous cherchez une conciergerie automobile à Gisors ? DreamEffect accompagne les propriétaires du Vexin : mise en location, organisation des remises, entretien et suivi.",
          "Un seul interlocuteur pour faire tourner votre véhicule sans charge mentale au quotidien.",
        ],
      },
      {
        title: "Gestion locative clé en main",
        paragraphs: [
          "Annonces, réservations, état des lieux et entretien courant — selon le mandat défini ensemble.",
        ],
        bullets: [
          "Conciergerie automobile Gisors & Vexin",
          "Calendrier et qualification des locataires",
          "Remises / reprises organisées localement",
          "Reporting propriétaire transparent",
        ],
      },
      {
        title: "Zone d’intervention",
        paragraphs: [
          "Gisors, Epte, communes du Vexin et axes vers Beauvais / Rouen. Contactez-nous pour confirmer la faisabilité selon votre véhicule et votre localisation.",
        ],
      },
    ],
    ctaTitle: "Confier votre véhicule à Gisors",
    ctaBody:
      "Échange rapide sur votre modèle, puis proposition de mise en gestion.",
    related: [
      { label: "Agence de location Gisors", href: "/agence-location-vehicule-gisors" },
      { label: "Conciergerie Beauvais", href: "/conciergerie-automobile-beauvais" },
      { label: "Espace propriétaires", href: "/proprietaires" },
    ],
  },
  "agence-location-vehicule-beauvais": {
    slug: "agence-location-vehicule-beauvais",
    city: "Beauvais",
    kind: "location",
    path: "/agence-location-vehicule-beauvais",
    metaTitle: "Agence de location de véhicules à Beauvais",
    metaDescription:
      "Agence de location à Beauvais : citadines, SUV et sportives chez DreamEffect. Réservation en ligne, remise locale dans l’Oise.",
    keywords: [
      "agence de location Beauvais",
      "agence location véhicule Beauvais",
      "location voiture Beauvais",
      "location auto Oise",
      "DreamEffect",
    ],
    heroEyebrow: "Beauvais · Location",
    heroTitle: "Agence de location de véhicules à Beauvais",
    heroDescription:
      "Flotte soignée, tarifs affichés, réservation simple — prise en charge locale dans l’Oise.",
    blocks: [
      {
        title: "Location de voiture à Beauvais",
        paragraphs: [
          "Vous cherchez une agence de location à Beauvais ? DreamEffect propose une flotte entretenue (citadine, SUV, sportive) avec réservation en ligne et organisation de la remise près de Beauvais.",
          "Idéal pour un week-end, un déplacement pro ou un essai plaisir — kilometrage et options clarifiés dès le devis.",
        ],
      },
      {
        title: "Une flotte adaptée",
        paragraphs: [
          "Chaque fiche véhicule détaille prix, dépôts et conditions. Pas de surprise à la remise des clés.",
        ],
        bullets: [
          "Agence de location Beauvais / Oise",
          "Réservation en ligne 24/7",
          "Remise et restitution locales",
          "Assistance WhatsApp & téléphone",
        ],
      },
      {
        title: "Simple et local",
        paragraphs: [
          "Processus digital (demande → devis → confirmation) et équipe joignable. Une alternative flexible aux grandes enseignes, avec le sérieux d’une maison locale.",
        ],
      },
    ],
    ctaTitle: "Voir la flotte disponible",
    ctaBody: "Parcourez les véhicules ou contactez-nous pour un devis selon vos dates.",
    related: [
      { label: "Conciergerie Beauvais", href: "/conciergerie-automobile-beauvais" },
      { label: "Agence de location Gisors", href: "/agence-location-vehicule-gisors" },
      { label: "Catalogue véhicules", href: "/vehicules" },
    ],
  },
  "agence-location-vehicule-gisors": {
    slug: "agence-location-vehicule-gisors",
    city: "Gisors",
    kind: "location",
    path: "/agence-location-vehicule-gisors",
    metaTitle: "Agence de location de véhicules à Gisors",
    metaDescription:
      "Agence de location à Gisors : flotte soignée DreamEffect, réservation en ligne, remise dans le Vexin. Conditions claires.",
    keywords: [
      "agence de location Gisors",
      "agence location véhicule Gisors",
      "location voiture Gisors",
      "location auto Vexin",
      "DreamEffect",
    ],
    heroEyebrow: "Gisors · Location",
    heroTitle: "Agence de location de véhicules à Gisors",
    heroDescription:
      "Véhicules entretenus, réservation simple, organisation locale autour de Gisors et du Vexin.",
    blocks: [
      {
        title: "Location de voiture à Gisors",
        paragraphs: [
          "Vous cherchez une agence de location à Gisors ? DreamEffect met à disposition des véhicules contrôlés, avec réservation en ligne et remise organisée près de Gisors.",
          "Week-end, remplacement ponctuel ou déplacement : conditions et kilometrage clairs dès le devis.",
        ],
      },
      {
        title: "Véhicules préparés avant remise",
        paragraphs: [
          "Choisissez parmi la flotte disponible — citadine, SUV ou sportive — selon vos besoins. Chaque véhicule est préparé avant la remise des clés.",
        ],
        bullets: [
          "Agence de location Gisors / Vexin",
          "Flotte contrôlée et assurée",
          "Devis et confirmation en ligne",
          "Équipe locale joignable",
        ],
      },
      {
        title: "Proximité Vexin",
        paragraphs: [
          "Service local pour Gisors et environs, avec la même exigence de suivi qu’à Beauvais. Contactez-nous pour les créneaux de remise.",
        ],
      },
    ],
    ctaTitle: "Réserver près de Gisors",
    ctaBody: "Consultez la flotte ou écrivez-nous pour un devis sur vos dates.",
    related: [
      { label: "Conciergerie Gisors", href: "/conciergerie-automobile-gisors" },
      { label: "Agence de location Beauvais", href: "/agence-location-vehicule-beauvais" },
      { label: "Catalogue véhicules", href: "/vehicules" },
    ],
  },
};

export const LOCAL_CITY_SLUGS = Object.keys(LOCAL_CITY_PAGES) as LocalCitySlug[];

export function getLocalCityPage(slug: string): LocalCityPage | null {
  if (!(slug in LOCAL_CITY_PAGES)) return null;
  return LOCAL_CITY_PAGES[slug as LocalCitySlug];
}
