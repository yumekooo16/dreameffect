import { SITE_URL } from "@/src/lib/public/site";

export const RESERVATION_DOC_TYPES = [
  {
    value: "id_card" as const,
    label: "Pièce d'identité",
    shortLabel: "CNI / passeport",
    fieldName: "id_card",
  },
  {
    value: "driving_license" as const,
    label: "Permis de conduire",
    shortLabel: "Permis",
    fieldName: "driving_license",
  },
  {
    value: "proof_of_address" as const,
    label: "Justificatif de domicile",
    shortLabel: "Justificatif (-3 mois)",
    fieldName: "proof_of_address",
  },
] as const;

export type ReservationDocType = (typeof RESERVATION_DOC_TYPES)[number]["value"];

export const RESERVATION_DOCS_STATUSES = [
  { value: "missing" as const, label: "Manquant" },
  { value: "partial" as const, label: "Partiel" },
  { value: "complete" as const, label: "Complet" },
  { value: "reviewed" as const, label: "Vérifié" },
] as const;

export type ReservationDocsStatus =
  (typeof RESERVATION_DOCS_STATUSES)[number]["value"];

export const RESERVATION_DOCS_BUCKET = "reservation-documents";

/** Durée de validité d'un lien d'upload (7 jours). */
export const UPLOAD_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const MAX_DOC_BYTES = 5 * 1024 * 1024;

export const ALLOWED_DOC_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function getReservationDocTypeLabel(type: string) {
  return (
    RESERVATION_DOC_TYPES.find((item) => item.value === type)?.label ?? type
  );
}

export function getReservationDocsStatusLabel(status: string) {
  return (
    RESERVATION_DOCS_STATUSES.find((item) => item.value === status)?.label ??
    status
  );
}

export function computeDocsStatus(
  uploadedTypes: Iterable<string>
): Exclude<ReservationDocsStatus, "reviewed"> {
  const set = new Set(uploadedTypes);
  const count = RESERVATION_DOC_TYPES.filter((item) => set.has(item.value))
    .length;

  if (count <= 0) return "missing";
  if (count >= RESERVATION_DOC_TYPES.length) return "complete";
  return "partial";
}

export function isReservationDocType(value: string): value is ReservationDocType {
  return RESERVATION_DOC_TYPES.some((item) => item.value === value);
}

export function buildDossierPublicUrl(token: string) {
  return `${SITE_URL}/dossier/${token}`;
}

export function buildDossierWhatsAppMessage({
  customerName,
  vehicleLabel,
  dossierUrl,
}: {
  customerName?: string | null;
  vehicleLabel?: string | null;
  dossierUrl: string;
}) {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName.trim()},`
    : "Bonjour,";

  return [
    greeting,
    "",
    vehicleLabel
      ? `Pour finaliser votre demande concernant la ${vehicleLabel}, merci de déposer vos documents via ce lien sécurisé :`
      : "Pour finaliser votre demande de location, merci de déposer vos documents via ce lien sécurisé :",
    dossierUrl,
    "",
    "Pièces demandées : pièce d'identité, permis de conduire, justificatif de domicile (-3 mois).",
    "",
    "DreamEffect",
  ].join("\n");
}
