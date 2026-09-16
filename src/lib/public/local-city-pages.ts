import type { InfoBlock } from "@/src/lib/public/info-content";

export type LocalCitySlug =
  | "conciergerie-automobile-beauvais"
  | "conciergerie-automobile-gisors"
  | "agence-location-vehicule-beauvais"
  | "agence-location-vehicule-gisors"
  | "location-vehicule-ile-de-france"
  | "location-vehicule-aeroport-beauvais-tille";

export type LocalCityPage = {
  slug: LocalCitySlug;
  city: "Beauvais" | "Gisors" | "Île-de-France" | "Tillé";
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
  "location-vehicule-ile-de-france": {
    slug: "location-vehicule-ile-de-france",
    city: "Île-de-France",
    kind: "location",
    path: "/location-vehicule-ile-de-france",
    metaTitle: "Location de véhicule en Île-de-France",
    metaDescription:
      "Location de véhicule haut de gamme en Île-de-France avec DreamEffect. Remise sur rendez-vous en IDF, flotte soignée, réservation WhatsApp.",
    keywords: [
      "location véhicule Île-de-France",
      "location voiture IDF",
      "location voiture Paris",
      "location auto Île-de-France",
      "DreamEffect IDF",
      "DreamEffect",
    ],
    heroEyebrow: "Île-de-France · Location",
    heroTitle: "Location de véhicule en Île-de-France",
    heroDescription:
      "Flotte premium, tarifs affichés, remise organisée sur rendez-vous en IDF — depuis notre base Beauvais / Gisors.",
    blocks: [
      {
        title: "Louer une voiture haut de gamme en IDF",
        paragraphs: [
          "Vous cherchez une location de véhicule en Île-de-France ? DreamEffect met à disposition une flotte soignée (berlines, SUV, sportives) avec réservation simple et conditions claires.",
          "Nous organisons la remise des clés sur rendez-vous selon votre lieu en IDF — idéal pour un week-end, un déplacement pro ou un essai plaisir.",
        ],
      },
      {
        title: "Une alternative locale aux grandes enseignes",
        paragraphs: [
          "Tarifs affichés sur chaque fiche, disponibilité mise à jour, interlocuteur unique par WhatsApp ou téléphone. Pas de call center anonyme : une maison de location et de conciergerie basée entre Oise et Vexin, active en Île-de-France.",
        ],
        bullets: [
          "Location véhicule Île-de-France / Paris et périphérie",
          "Remise sur rendez-vous selon vos contraintes",
          "Flotte contrôlée et préparée avant chaque location",
          "Devis et confirmation via WhatsApp",
        ],
      },
      {
        title: "Aussi pour les propriétaires en IDF",
        paragraphs: [
          "Vous habitez en Île-de-France et souhaitez confier votre véhicule ? Notre conciergerie automobile gère mise en location, entretien et suivi — contactez-nous pour étudier la faisabilité.",
        ],
      },
    ],
    ctaTitle: "Réserver en Île-de-France",
    ctaBody:
      "Parcourez la flotte ou contactez-nous pour un devis selon vos dates et votre lieu de remise.",
    related: [
      { label: "Agence Beauvais", href: "/agence-location-vehicule-beauvais" },
      { label: "Aéroport Beauvais-Tillé", href: "/location-vehicule-aeroport-beauvais-tille" },
      { label: "Espace propriétaires", href: "/proprietaires" },
    ],
  },
  "location-vehicule-aeroport-beauvais-tille": {
    slug: "location-vehicule-aeroport-beauvais-tille",
    city: "Tillé",
    kind: "location",
    path: "/location-vehicule-aeroport-beauvais-tille",
    metaTitle: "Location de véhicule aéroport Beauvais-Tillé",
    metaDescription:
      "Location voiture près de l’aéroport de Beauvais-Tillé (BVA). Remise organisée autour de Tillé / Beauvais, flotte DreamEffect, réservation WhatsApp.",
    keywords: [
      "location voiture aéroport Beauvais",
      "location véhicule Beauvais-Tillé",
      "location auto BVA",
      "location voiture Tillé",
      "aéroport Beauvais location",
      "DreamEffect",
    ],
    heroEyebrow: "Aéroport Beauvais-Tillé · BVA",
    heroTitle: "Location de véhicule à l’aéroport de Beauvais-Tillé",
    heroDescription:
      "Arrivée ou départ à BVA : organisez la remise près de Tillé / Beauvais avec une flotte soignée et un interlocuteur local.",
    blocks: [
      {
        title: "Une location pratique près de BVA",
        paragraphs: [
          "Vous atterrissez à l’aéroport de Beauvais-Tillé ou vous partez en vol ? DreamEffect organise la remise d’un véhicule haut de gamme autour de Tillé et Beauvais, sur rendez-vous.",
          "Alternative claire aux comptoirs aéroportuaires : tarifs affichés, véhicule préparé, suivi WhatsApp du début à la fin.",
        ],
      },
      {
        title: "Comment ça se passe",
        paragraphs: [
          "Choisissez le modèle, indiquez vos dates et votre créneau d’arrivée ou de départ. Nous confirmons la disponibilité et le lieu de remise (parking, rendez-vous local selon le cas).",
        ],
        bullets: [
          "Location près de l’aéroport Beauvais-Tillé (BVA)",
          "Remise / restitution organisées localement",
          "Flotte premium contrôlée avant chaque départ",
          "Réponse rapide en heures ouvrées",
        ],
      },
      {
        title: "Zone desservie",
        paragraphs: [
          "Tillé, Beauvais et communes voisines de l’Oise. Pour une remise plus loin (Gisors, Île-de-France), contactez-nous : nous étudions la faisabilité selon le véhicule et le planning.",
        ],
      },
    ],
    ctaTitle: "Réserver près de Beauvais-Tillé",
    ctaBody:
      "Indiquez vos dates et votre vol : nous revenons avec un créneau de remise adapté.",
    related: [
      { label: "Agence de location Beauvais", href: "/agence-location-vehicule-beauvais" },
      { label: "Location Île-de-France", href: "/location-vehicule-ile-de-france" },
      { label: "Catalogue véhicules", href: "/vehicules" },
    ],
  },
};

export const LOCAL_CITY_SLUGS = Object.keys(LOCAL_CITY_PAGES) as LocalCitySlug[];

export function getLocalCityPage(slug: string): LocalCityPage | null {
  if (!(slug in LOCAL_CITY_PAGES)) return null;
  return LOCAL_CITY_PAGES[slug as LocalCitySlug];
}
