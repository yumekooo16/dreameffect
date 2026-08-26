import { CONTACT_EMAIL, CONTACT_PHONE } from "@/src/lib/public/contact";
import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";
import { LEGAL_ROUTES, SITE_NAME, SITE_URL } from "@/src/lib/public/site";

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

/**
 * Identité légale DREAMEFFECT (SIREN 108 889 791) — source INSEE / RNE.
 * Surchargeable via variables d'environnement si le siège ou les mentions évoluent.
 */
export const LEGAL_ENTITY = {
  tradeName: SITE_NAME,
  legalName: env("NEXT_PUBLIC_LEGAL_NAME") ?? "DREAMEFFECT",
  legalForm: env("NEXT_PUBLIC_LEGAL_FORM") ?? "SAS",
  capital: env("NEXT_PUBLIC_LEGAL_CAPITAL"),
  siren: env("NEXT_PUBLIC_LEGAL_SIREN") ?? "108 889 791",
  siret: env("NEXT_PUBLIC_LEGAL_SIRET") ?? "108 889 791 00019",
  rcs: env("NEXT_PUBLIC_LEGAL_RCS") ?? "108 889 791 R.C.S. Paris",
  vat: env("NEXT_PUBLIC_LEGAL_VAT") ?? "FR60108889791",
  naf: env("NEXT_PUBLIC_LEGAL_NAF") ?? "77.11A — Location de courte durée de voitures et de véhicules automobiles légers",
  publicationDirector:
    env("NEXT_PUBLIC_PUBLICATION_DIRECTOR") ?? "Wyatt Charleston",
  street: env("NEXT_PUBLIC_LEGAL_STREET") ?? "47 rue Vivienne",
  city: env("NEXT_PUBLIC_LEGAL_CITY") ?? "Paris",
  postalCode: env("NEXT_PUBLIC_LEGAL_POSTAL_CODE") ?? "75002",
  region: env("NEXT_PUBLIC_LEGAL_REGION") ?? "Île-de-France",
  country: "France",
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,
} as const;

export const HOSTING_PROVIDER = {
  name: "Vercel Inc.",
  address: "440 Terry Avenue North, Seattle, WA 98109, États-Unis",
  website: "https://vercel.com",
} as const;

export function formatLegalAddress() {
  const { street, postalCode, city, country } = LEGAL_ENTITY;
  return [street, `${postalCode} ${city}`, country].filter(Boolean).join(", ");
}

export type LegalBlock = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export function getLegalNoticeBlocks(): LegalBlock[] {
  const identification = [
    `Le site ${SITE_URL} est édité par la société ${LEGAL_ENTITY.legalName}, sous le nom commercial ${LEGAL_ENTITY.tradeName}.`,
    `Forme juridique : ${LEGAL_ENTITY.legalForm}.`,
    `Siège social : ${formatLegalAddress()}.`,
    `Email : ${LEGAL_ENTITY.email}. Téléphone : ${LEGAL_ENTITY.phone}.`,
    `SIREN : ${LEGAL_ENTITY.siren}.`,
    `SIRET : ${LEGAL_ENTITY.siret}.`,
    `RCS : ${LEGAL_ENTITY.rcs}.`,
    `Code NAF / APE : ${LEGAL_ENTITY.naf}.`,
    `TVA intracommunautaire : ${LEGAL_ENTITY.vat}.`,
  ];

  if (LEGAL_ENTITY.capital) {
    identification.push(`Capital social : ${LEGAL_ENTITY.capital}.`);
  }

  return [
    {
      title: "Éditeur du site",
      paragraphs: identification,
    },
    {
      title: "Directeur de la publication",
      paragraphs: [
        `Le directeur de la publication est ${LEGAL_ENTITY.publicationDirector}, Président de la SAS ${LEGAL_ENTITY.legalName}.`,
      ],
    },
    {
      title: "Hébergement",
      paragraphs: [
        `Le site est hébergé par ${HOSTING_PROVIDER.name}, ${HOSTING_PROVIDER.address}. Site : ${HOSTING_PROVIDER.website}.`,
      ],
    },
    {
      title: "Activité",
      paragraphs: [
        `${SITE_NAME} propose la location de véhicules haut de gamme, la conciergerie automobile et la gestion locative pour propriétaires.`,
        `Zones d'activité principales : ${formatServiceAreaLabel()}. Le siège social est à Paris ; les remises de clés et l'accueil clients se font à Beauvais, Gisors ou sur rendez-vous dans l'Oise et l'Eure.`,
        "Les réservations se font par WhatsApp, téléphone ou formulaire. Aucun paiement n'est encaissé en ligne sur ce site.",
      ],
    },
    {
      title: "Propriété intellectuelle",
      paragraphs: [
        `L'ensemble des contenus du site (textes, visuels, logo, structure) est protégé. Toute reproduction non autorisée est interdite.`,
        "Les photos de véhicules illustrent la flotte ou des modèles comparables ; les marques citées appartiennent à leurs titulaires.",
      ],
    },
    {
      title: "Responsabilité",
      paragraphs: [
        "Les informations publiées sont fournies à titre indicatif. Les tarifs, disponibilités et caractéristiques d'un véhicule sont confirmés au moment de la réservation.",
        "DreamEffect ne saurait être tenu responsable d'une indisponibilité temporaire du site ou d'un usage non conforme des contenus.",
      ],
    },
    {
      title: "Données personnelles",
      paragraphs: [
        `Le traitement des données est décrit dans la politique de confidentialité (${LEGAL_ROUTES.privacy}).`,
      ],
    },
    {
      title: "Droit applicable",
      paragraphs: [
        "Les présentes mentions sont régies par le droit français. En cas de litige, et à défaut d'accord amiable, les tribunaux français sont compétents.",
      ],
    },
  ];
}

export function getPrivacyBlocks(): LegalBlock[] {
  return [
    {
      title: "Responsable de traitement",
      paragraphs: [
        `${LEGAL_ENTITY.legalName}, ${LEGAL_ENTITY.legalForm} (${SITE_NAME}), SIRET ${LEGAL_ENTITY.siret}, est responsable du traitement des données collectées via ${SITE_URL}.`,
        `Contact : ${LEGAL_ENTITY.email} — ${LEGAL_ENTITY.phone}. Siège social : ${formatLegalAddress()}.`,
      ],
    },
    {
      title: "Données collectées",
      paragraphs: [
        "Nous collectons uniquement les données nécessaires pour répondre à une demande de location, de gestion locative ou de contact.",
      ],
      bullets: [
        "Identité et coordonnées : nom, prénom, email, téléphone.",
        "Contenu du message : dates souhaitées, véhicule, précisions sur un projet propriétaire.",
        "Session de connexion pour les espaces admin et propriétaire, et l'option « Rester connecté » si elle est cochée.",
        "Échanges WhatsApp ou téléphoniques lorsque vous nous contactez par ces canaux.",
      ],
    },
    {
      title: "Finalités et bases légales",
      paragraphs: ["Les traitements reposent sur les bases suivantes."],
      bullets: [
        "Exécution de mesures précontractuelles ou contractuelles : traiter une demande de réservation ou de mise en gestion.",
        "Intérêt légitime : répondre aux messages, suivre une location, prévenir la fraude ou les abus.",
        "Consentement : traitement d'une demande via le formulaire de contact.",
        "Obligation légale : conservation de pièces utiles à la facturation ou à un litige.",
      ],
    },
    {
      title: "Destinataires",
      paragraphs: [
        "Les données sont destinées à l'équipe DreamEffect. Elles peuvent être traitées par nos sous-traitants techniques (hébergement Vercel, base de données Supabase, messagerie) dans le cadre de leur mission, uniquement.",
        "WhatsApp (Meta) est utilisé si vous choisissez ce canal : son traitement est alors régi par les conditions de ce service.",
        "Aucune donnée n'est vendue. Aucune mesure d'audience publicitaire n'est déposée.",
      ],
    },
    {
      title: "Durées de conservation",
      paragraphs: [
        "Les demandes de contact sont conservées le temps du traitement, puis jusqu'à 3 ans après le dernier échange pour le suivi commercial, sauf opposition.",
        "Les données liées à une location (contrat, identité, caution) sont conservées pendant la durée légale applicable (notamment pièces comptables : 10 ans).",
        "Une session connectée dure le temps de la connexion. L'option « Rester connecté » est conservée 30 jours.",
      ],
    },
    {
      title: "Vos droits",
      paragraphs: [
        "Vous disposez des droits d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité, dans les conditions du RGPD.",
        `Pour les exercer : ${LEGAL_ENTITY.email}. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).`,
      ],
    },
    {
      title: "Transferts hors UE",
      paragraphs: [
        "L'hébergement Vercel et certains outils techniques peuvent impliquer un transfert vers les États-Unis. Ces prestataires s'appuient sur des clauses contractuelles types ou un cadre reconnu (Data Privacy Framework le cas échéant).",
      ],
    },
  ];
}

export function getRentalTermsBlocks(): LegalBlock[] {
  return [
    {
      title: "Objet",
      paragraphs: [
        `Les présentes conditions générales de location (CGL) encadrent la location de véhicules proposée par ${SITE_NAME} via ${SITE_URL}, WhatsApp, téléphone ou formulaire.`,
        "Toute réservation implique l'acceptation de ces conditions. Un contrat de location individuel précise les éléments propres au véhicule et aux dates retenues.",
      ],
    },
    {
      title: "Réservation",
      paragraphs: [
        "La demande se fait depuis la fiche véhicule (calendrier de disponibilités) puis par WhatsApp, ou via le formulaire de contact. Aucun paiement n'est encaissé en ligne.",
        "La réservation n'est ferme qu'après confirmation écrite de DreamEffect (message ou contrat) et, le cas échéant, versement de l'acompte convenu.",
        "Les disponibilités affichées sont indicatives et peuvent évoluer jusqu'à confirmation.",
      ],
    },
    {
      title: "Conditions du locataire — âge et permis",
      paragraphs: [
        "Le locataire doit être une personne physique identifiée, titulaire d'un permis de conduire en cours de validité adapté à la catégorie du véhicule.",
      ],
      bullets: [
        "Âge minimum : 21 ans, et permis obtenu depuis au moins 2 ans.",
        "Certains véhicules sportifs ou haut de gamme peuvent exiger 23 ou 25 ans et/ou 3 ans de permis : ces seuils sont précisés à la confirmation de réservation.",
        "Une pièce d'identité et le permis (original) sont présentés à la remise des clés. DreamEffect peut refuser la location en cas de document incomplet, de permis probatoire inadapté ou de doute raisonnable sur l'identité.",
        "Le véhicule ne peut être conduit que par le locataire et les conducteurs additionnels expressément désignés au contrat.",
      ],
    },
    {
      title: "Caution",
      paragraphs: [
        "Une caution est exigée pour chaque location. Son montant figure sur la fiche du véhicule (rubrique Caution) et est rappelé à la confirmation.",
      ],
      bullets: [
        "La caution est en général une empreinte bancaire ou un dépôt, selon le moyen convenu (carte, virement).",
        "Elle est bloquée au plus tard à la remise des clés et libérée après restitution, sous réserve de l'état du véhicule, du carburant et des éventuels frais (franchise, kilomètres, retard, propreté).",
        "Le délai de déblocage dépend de la banque du locataire (souvent quelques jours ouvrés après validation par DreamEffect).",
        "En cas de dégradations, franchise d'assurance, amendes ou manquants, tout ou partie de la caution peut être retenu, avec justificatifs.",
      ],
    },
    {
      title: "Assurance",
      paragraphs: [
        "Le véhicule est assuré pour l'usage de location. Les garanties exactes, la franchise et les exclusions sont communiquées avant la signature du contrat et font partie des conditions particulières.",
      ],
      bullets: [
        "Une responsabilité civile est toujours prévue. Une couverture dommages / vol s'applique selon le contrat d'assurance du véhicule.",
        "Une franchise reste à la charge du locataire en cas de sinistre responsable, de vol ou de vandalisme, sauf rachat de franchise expressément souscrit si cette option est proposée.",
        "Sont notamment exclus ou peuvent faire perdre la garantie : conduite sous l'emprise d'alcool ou de stupéfiants, utilisation sur circuit, sous-location, transport rémunéré de personnes, fausse déclaration, conducteur non autorisé.",
        "Tout accident, vol ou dégradation doit être signalé immédiatement à DreamEffect. Un constat amiable est établi le cas échéant.",
      ],
    },
    {
      title: "Kilométrage",
      paragraphs: [
        "Un forfait kilométrique est associé à chaque location. Le volume inclus (par jour ou pour la durée totale) est indiqué à la confirmation de réservation, car il peut varier selon le modèle.",
      ],
      bullets: [
        "Sauf mention contraire au contrat, un forfait de l'ordre de 150 à 200 km par période de 24 h est retenu comme base de discussion ; le kilométrage contractuel fait foi.",
        "Les kilomètres supplémentaires sont facturés au tarif indiqué au contrat (prix par km au-delà du forfait).",
        "Le compteur est relevé à la remise et à la restitution. Toute tentative de falsification entraîne la facturation du maximum raisonnablement estimé et peut justifier la retenue de caution.",
        "Les trajets hors France métropolitaine, vers l'étranger ou dans certaines zones (aéroports hors remise convenue, ferries) nécessitent un accord écrit préalable.",
      ],
    },
    {
      title: "Remise des clés, carburant et usage",
      paragraphs: [
        "La remise et la restitution ont lieu à Beauvais, Gisors ou à un point convenu dans l'Oise et l'Eure (domicile, gare, aéroport de Beauvais-Tillé, etc.).",
        "Le véhicule est remis propre, avec le niveau de carburant indiqué au contrat. Il doit être restitué dans le même état de propreté et avec le même niveau de carburant, sauf accord contraire.",
        "Le locataire utilise le véhicule en bon père de famille : respect du code de la route, pas de fumeur si interdit au contrat, pas d'animaux sans accord, pas de modifications mécaniques.",
      ],
    },
    {
      title: "Tarifs, durée et retard",
      paragraphs: [
        "Les tarifs affichés sur le site sont indicatifs (journée, week-end, semaine). Le prix ferme est celui confirmé pour les dates retenues.",
        "Toute heure de retard à la restitution peut être facturée, jusqu'à une journée supplémentaire, et peut impacter la caution si une location suivante est compromise.",
      ],
    },
    {
      title: "Annulation",
      paragraphs: [
        "Les modalités d'annulation (délais, retenue d'acompte) sont précisées à la confirmation. En l'absence de stipulation particulière :",
      ],
      bullets: [
        "Annulation plus de 48 h avant le début : acompte restitué, hors frais déjà engagés (livraison spécifique, préparation).",
        "Annulation moins de 48 h avant, ou non-présentation : l'acompte peut rester acquis ; DreamEffect s'efforce de reproposer d'autres dates.",
        "Annulation du fait de DreamEffect (indisponibilité, cas de force majeure) : somme versée restituée, sans autre indemnité forfaitaire.",
      ],
    },
    {
      title: "Réclamations et droit applicable",
      paragraphs: [
        `Pour toute réclamation : ${LEGAL_ENTITY.email} ou ${LEGAL_ENTITY.phone}.`,
        "Droit français. Médiation de la consommation : si le litige n'est pas réglé amiablement, le locataire consommateur peut recourir à un médiateur dont les coordonnées seront communiquées sur demande, conformément au code de la consommation.",
      ],
    },
  ];
}
