/** Contenu éditorial des pages informatives SEO. */

export type InfoBlock = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const INSURANCE_INFO_BLOCKS: InfoBlock[] = [
  {
    title: "Assurance et location de véhicule premium",
    paragraphs: [
      "Louer un véhicule haut de gamme implique une couverture adaptée à l'usage locatif. Chez DreamEffect, nous vérifions avec vous que l'assurance correspond à la durée, au type de véhicule et à votre profil de conducteur avant toute remise des clés.",
    ],
  },
  {
    title: "Ce que couvre généralement une location",
    paragraphs: [
      "Selon le contrat retenu, la couverture peut inclure la responsabilité civile, la protection du véhicule (dommages, vol, bris de glace) et une assistance en cas de panne ou d'accident. Les franchises et plafonds varient selon le modèle et la durée.",
    ],
    bullets: [
      "Responsabilité civile obligatoire pour circuler en France",
      "Protection du véhicule locatif (dommages, vol) selon formule",
      "Assistance routière et véhicule de remplacement le cas échéant",
      "Franchise et caution précisées avant signature",
    ],
  },
  {
    title: "Documents et conditions du conducteur",
    paragraphs: [
      "Un permis valide (original), une pièce d'identité et parfois un justificatif de domicile sont demandés à la remise des clés. L'âge minimum et l'ancienneté du permis peuvent varier selon la catégorie du véhicule.",
    ],
  },
  {
    title: "Caution et franchise",
    paragraphs: [
      "Une caution peut être demandée avant la location. Elle est restituée après inspection du véhicule au retour, sous réserve d'absence de dommages non couverts. Les montants et modalités sont confirmés par écrit lors de la réservation.",
    ],
  },
  {
    title: "Besoin d'un éclaircissement ?",
    paragraphs: [
      "Chaque véhicule et chaque durée de location peuvent avoir des spécificités. Contactez-nous par WhatsApp ou téléphone : nous vous répondons avec des conditions claires avant de confirmer votre réservation.",
    ],
  },
];

export const OWNER_MANAGEMENT_INFO_BLOCKS: InfoBlock[] = [
  {
    title: "Comment fonctionne la gestion locative pour propriétaires",
    paragraphs: [
      "DreamEffect accompagne les propriétaires de véhicules haut de gamme qui souhaitent rentabiliser leur auto sans gérer au quotidien réservations, remises de clés et entretien. Vous restez propriétaire ; nous opérons la mise en location.",
    ],
  },
  {
    title: "Mise en place",
    paragraphs: [
      "Après un échange sur votre véhicule (marque, modèle, année, état), nous définissons ensemble les conditions de mise à disposition, le calendrier souhaité et les tarifs. Votre annonce est créée sur notre catalogue avec photos et description optimisées.",
    ],
    bullets: [
      "Prise de contact et état des lieux initial",
      "Création de la fiche véhicule et tarification",
      "Mise en ligne sur dreameffect.fr et canaux de réservation",
    ],
  },
  {
    title: "Ce que DreamEffect prend en charge",
    paragraphs: [
      "De la demande de location au retour du véhicule, un interlocuteur unique gère l'ensemble du parcours locatif.",
    ],
    bullets: [
      "Réception et qualification des demandes de location",
      "Organisation des remises et retours de clés",
      "Suivi pendant la location et coordination entretien",
      "Reporting et versement de vos revenus",
    ],
  },
  {
    title: "Transparence et suivi",
    paragraphs: [
      "Les propriétaires disposent d'un espace dédié pour suivre les réservations, les revenus et l'activité de leur véhicule. La répartition des revenus est définie contractuellement et appliquée automatiquement.",
    ],
  },
  {
    title: "Proposer votre véhicule",
    paragraphs: [
      "Vous possédez une berline, un SUV ou une sportive que vous souhaitez confier ? Contactez-nous via le formulaire propriétaires ou par WhatsApp. Nous revenons vers vous sous 24 h ouvrées avec les prochaines étapes.",
    ],
  },
];
