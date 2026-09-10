/**
 * Champs variables du contrat DreamEffect.
 * L'IA n'écrit jamais de clause : elle ne remplit que ces champs.
 */

export const CONTRACT_FIELD_DEFS = [
  {
    name: "first_name",
    label: "Prénom",
    group: "identity",
  },
  {
    name: "last_name",
    label: "Nom",
    group: "identity",
  },
  {
    name: "birth_date",
    label: "Date de naissance",
    group: "identity",
  },
  {
    name: "birth_place",
    label: "Lieu de naissance",
    group: "identity",
  },
  {
    name: "nationality",
    label: "Nationalité",
    group: "identity",
  },
  {
    name: "address",
    label: "Adresse",
    group: "address",
  },
  {
    name: "postal_code",
    label: "Code postal",
    group: "address",
  },
  {
    name: "city",
    label: "Ville",
    group: "address",
  },
  {
    name: "id_document_number",
    label: "N° pièce d'identité",
    group: "identity",
  },
  {
    name: "driving_license_number",
    label: "N° permis de conduire",
    group: "license",
  },
  {
    name: "driving_license_issue_date",
    label: "Date de délivrance du permis",
    group: "license",
  },
  {
    name: "driving_license_categories",
    label: "Catégories de permis",
    group: "license",
  },
  {
    name: "proof_of_address_type",
    label: "Type de justificatif",
    group: "address",
  },
  {
    name: "proof_of_address_date",
    label: "Date du justificatif",
    group: "address",
  },
  {
    name: "phone",
    label: "Téléphone",
    group: "contact",
  },
  {
    name: "email",
    label: "Email",
    group: "contact",
  },
] as const;

export type ContractFieldName = (typeof CONTRACT_FIELD_DEFS)[number]["name"];

export type FieldConfidence = "high" | "medium" | "low" | "unknown";

export type ExtractedFieldRecord = {
  id?: string;
  reservation_id: string;
  field_name: ContractFieldName | string;
  value: string | null;
  confidence: FieldConfidence;
  source_document: string | null;
  status: "pending" | "validated" | "rejected" | "manual";
  needs_review: boolean;
  inconsistency_note: string | null;
};

export function getContractFieldLabel(name: string) {
  return CONTRACT_FIELD_DEFS.find((item) => item.name === name)?.label ?? name;
}

/** Normalise pour comparer deux valeurs extraites. */
export function normalizeFieldValue(value: string | null | undefined) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
