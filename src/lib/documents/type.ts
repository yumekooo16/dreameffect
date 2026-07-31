export type DocumentType =
  | "registration"
  | "insurance"
  | "other"
  | "contract"
  | "invoice";

export const DOCUMENT_TYPES = [
  { value: "registration" as const, label: "Carte grise" },
  { value: "insurance" as const, label: "Assurance" },
  { value: "other" as const, label: "Contrôle technique" },
  { value: "contract" as const, label: "Contrat" },
  { value: "invoice" as const, label: "Facture" },
] as const;

export type DocumentStatus =
  | "valid"
  | "expired"
  | "expiring_soon"
  | "no_expiration";

export const DOCUMENT_STATUS_FILTERS = [
  { value: "all", label: "Tous les statuts" },
  { value: "valid", label: "Valide" },
  { value: "expired", label: "Expiré" },
  { value: "expiring_soon", label: "Expire bientôt" },
  { value: "no_expiration", label: "Sans expiration" },
] as const;

export type DocumentStatusFilter =
  (typeof DOCUMENT_STATUS_FILTERS)[number]["value"];

const TYPE_LABELS: Record<DocumentType, string> = Object.fromEntries(
  DOCUMENT_TYPES.map((t) => [t.value, t.label])
) as Record<DocumentType, string>;

const TYPE_BADGES: Record<DocumentType, string> = {
  registration: "de-badge--confirmed",
  insurance: "de-badge--finished",
  other: "de-badge--pending",
  contract: "de-badge--finished",
  invoice: "de-badge--pending",
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  valid: "Valide",
  expired: "Expiré",
  expiring_soon: "Expire bientôt",
  no_expiration: "Sans expiration",
};

const STATUS_BADGES: Record<DocumentStatus, string> = {
  valid: "de-badge--valid",
  expired: "de-badge--invalid",
  expiring_soon: "de-badge--pending",
  no_expiration: "de-badge--finished",
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const EXPIRING_SOON_DAYS = 30;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDocumentTypeLabel(type: string) {
  return TYPE_LABELS[type as DocumentType] ?? type;
}

export function getDocumentTypeBadgeClass(type: string) {
  return TYPE_BADGES[type as DocumentType] ?? "de-badge--finished";
}

export function getDocumentStatus(doc: {
  expiration_date?: string | null;
  is_valid?: boolean | null;
}): DocumentStatus {
  if (doc.is_valid === false) return "expired";

  if (!doc.expiration_date) return "no_expiration";

  const today = startOfDay(new Date());
  const expiration = startOfDay(new Date(doc.expiration_date));

  if (expiration < today) return "expired";

  const in30Days = new Date(today.getTime() + EXPIRING_SOON_DAYS * MS_PER_DAY);
  if (expiration <= in30Days) return "expiring_soon";

  return "valid";
}

export function getDocumentStatusLabel(doc: {
  expiration_date?: string | null;
  is_valid?: boolean | null;
}) {
  return STATUS_LABELS[getDocumentStatus(doc)];
}

export function getDocumentStatusBadgeClass(doc: {
  expiration_date?: string | null;
  is_valid?: boolean | null;
}) {
  return STATUS_BADGES[getDocumentStatus(doc)];
}

export function computeDocumentIsValid(expirationDate?: string | null) {
  if (!expirationDate) return true;
  const today = startOfDay(new Date());
  const expiration = startOfDay(new Date(expirationDate));
  return expiration >= today;
}

export function isDocumentExpiringSoon(doc: {
  expiration_date?: string | null;
  is_valid?: boolean | null;
}) {
  const status = getDocumentStatus(doc);
  return status === "expiring_soon" || status === "expired";
}
