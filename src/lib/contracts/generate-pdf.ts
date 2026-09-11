import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  CONTRACT_FIELD_DEFS,
  type ContractFieldName,
} from "@/src/lib/contracts/fields";
import { formatLegalAddress, LEGAL_ENTITY } from "@/src/lib/public/legal";

export type ContractFillPayload = {
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  nationality: string;
  address: string;
  postal_code: string;
  city: string;
  id_document_number: string;
  driving_license_number: string;
  driving_license_issue_date: string;
  driving_license_categories: string;
  proof_of_address_type: string;
  proof_of_address_date: string;
  phone: string;
  email: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_label: string;
  vehicle_plate: string;
  vehicle_vin: string;
  vehicle_color: string;
  vehicle_mileage: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  duration_days: string;
  daily_rate: string;
  pickup_location: string;
  return_location: string;
  total_price: string;
  deposit: string;
  distance_km: string;
  reservation_id: string;
  generated_at: string;
  signed_at_place: string;
};

export const CONTRACT_TEMPLATE_VERSION = "avocat-v2-overlay";
export const CONTRACT_TEMPLATE_FILENAME =
  "contrat-location-dreameffect-v2.pdf";

const PAGE_H = 841.89;
const INK = rgb(0.05, 0.08, 0.14);

type Blank = {
  /** Top-left Y from PDF text extraction (origin top-left). */
  top: number;
  bottom: number;
  x: number;
  maxWidth: number;
  size?: number;
};

/**
 * IMPORTANT JURIDIQUE
 * -------------------
 * Ce générateur NE rédige PAS et NE modifie PAS les clauses.
 * Il charge le PDF avocat officiel et superpose uniquement les valeurs
 * variables dans les zones à underscores de la page 1 (+ lieu/date signature).
 */
export async function buildFilledContractPdf(
  payload: ContractFillPayload
): Promise<Uint8Array> {
  const templateBytes = await loadOfficialTemplate();
  const pdf = await PDFDocument.load(templateBytes, {
    updateMetadata: false,
  });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const page1 = pages[0];
  if (!page1) {
    throw new Error("Modèle contrat invalide (aucune page).");
  }

  const draw = (blank: Blank, value: string | null | undefined) => {
    drawInBlank(page1, font, blank, value);
  };

  // En-tête société (mentions légales déjà validées côté site)
  // Les blancs du PDF sont courts : on reste dans chaque zone d'underscores.
  draw(
    { top: 48.1, bottom: 59.1, x: 250, maxWidth: 155, size: 7.5 },
    formatLegalAddress()
  );
  draw(
    { top: 59.4, bottom: 70.4, x: 164, maxWidth: 28, size: 7 },
    LEGAL_ENTITY.legalForm
  );
  draw(
    { top: 59.4, bottom: 70.4, x: 246, maxWidth: 28, size: 7 },
    LEGAL_ENTITY.capital.replace(/\s*€\s*$/i, "").trim()
  );
  draw(
    { top: 59.4, bottom: 70.4, x: 312, maxWidth: 28, size: 7 },
    LEGAL_ENTITY.siren.replace(/\s/g, "").slice(0, 9)
  );

  // 1) Locataire
  draw({ top: 125.2, bottom: 136.9, x: 78, maxWidth: 138 }, payload.last_name);
  draw({ top: 125.2, bottom: 136.9, x: 338, maxWidth: 138 }, payload.first_name);
  draw({ top: 144.2, bottom: 155.9, x: 93, maxWidth: 138 }, payload.address);
  draw(
    { top: 144.2, bottom: 155.9, x: 342, maxWidth: 128 },
    joinNonEmpty(payload.postal_code, payload.city)
  );
  draw({ top: 163.2, bottom: 174.9, x: 102, maxWidth: 124 }, payload.phone);
  draw({ top: 163.2, bottom: 174.9, x: 329, maxWidth: 152 }, payload.email);
  draw(
    { top: 182.2, bottom: 193.9, x: 159, maxWidth: 82 },
    joinNonEmpty(payload.birth_date, payload.birth_place, " / ")
  );
  draw(
    { top: 182.2, bottom: 193.9, x: 380, maxWidth: 96 },
    payload.id_document_number
  );
  draw(
    { top: 201.2, bottom: 212.9, x: 150, maxWidth: 90 },
    payload.driving_license_number
  );
  draw(
    { top: 201.2, bottom: 212.9, x: 373, maxWidth: 110 },
    payload.driving_license_issue_date
  );

  // 3) Véhicule
  draw({ top: 361.2, bottom: 372.9, x: 90, maxWidth: 128 }, payload.vehicle_brand);
  draw({ top: 361.2, bottom: 372.9, x: 336, maxWidth: 138 }, payload.vehicle_model);
  draw({ top: 380.2, bottom: 391.9, x: 123, maxWidth: 100 }, payload.vehicle_plate);
  draw({ top: 380.2, bottom: 391.9, x: 338, maxWidth: 132 }, payload.vehicle_color);
  draw(
    { top: 399.2, bottom: 410.9, x: 157, maxWidth: 78 },
    payload.vehicle_mileage
  );

  // 4) Durée / tarif
  draw({ top: 488.7, bottom: 500.4, x: 114, maxWidth: 100 }, payload.start_date);
  draw({ top: 488.7, bottom: 500.4, x: 330, maxWidth: 128 }, payload.start_time);
  draw({ top: 507.7, bottom: 519.4, x: 115, maxWidth: 100 }, payload.end_date);
  draw({ top: 507.7, bottom: 519.4, x: 330, maxWidth: 128 }, payload.end_time);
  draw({ top: 526.7, bottom: 538.4, x: 143, maxWidth: 90 }, payload.duration_days);
  draw({ top: 526.7, bottom: 538.4, x: 377, maxWidth: 100 }, payload.daily_rate);
  draw({ top: 545.7, bottom: 557.4, x: 128, maxWidth: 100 }, payload.distance_km);
  draw({ top: 561.7, bottom: 573.4, x: 164, maxWidth: 230 }, payload.total_price);

  // 5) Caution
  draw({ top: 609.2, bottom: 620.9, x: 185, maxWidth: 208 }, payload.deposit);

  // Page signatures : lieu + date (ne touche pas aux clauses)
  const signaturePage = pages[5];
  if (signaturePage) {
    drawInBlank(
      signaturePage,
      font,
      { top: 485.2, bottom: 496.9, x: 88, maxWidth: 160 },
      payload.signed_at_place
    );
    drawInBlank(
      signaturePage,
      font,
      { top: 485.2, bottom: 496.9, x: 273, maxWidth: 112 },
      new Date().toLocaleDateString("fr-FR")
    );
  }

  pdf.setTitle("Contrat de location — DreamEffect");
  pdf.setSubject(
    `Remplissage variables réservation ${payload.reservation_id} (clauses avocat inchangées)`
  );
  pdf.setProducer("DreamEffect contract autofill");
  pdf.setCreationDate(new Date());

  return pdf.save({ useObjectStreams: false });
}

async function loadOfficialTemplate(): Promise<Uint8Array> {
  const templatePath = path.join(
    process.cwd(),
    "contracts",
    "templates",
    CONTRACT_TEMPLATE_FILENAME
  );
  try {
    const buf = await readFile(templatePath);
    return new Uint8Array(buf);
  } catch {
    throw new Error(
      `Modèle avocat introuvable (${CONTRACT_TEMPLATE_FILENAME}). Vérifiez contracts/templates/.`
    );
  }
}

function drawInBlank(
  page: PDFPage,
  font: PDFFont,
  blank: Blank,
  raw: string | null | undefined
) {
  const text = sanitizePdfText(raw);
  if (!text) return;

  const size = blank.size ?? 9;
  const fitted = fitText(font, text, size, blank.maxWidth);
  const y = PAGE_H - blank.bottom + 2.2;

  page.drawText(fitted, {
    x: blank.x,
    y,
    size,
    font,
    color: INK,
  });
}

function fitText(font: PDFFont, text: string, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1) {
    truncated = truncated.slice(0, -1);
    const candidate = `${truncated}...`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) return candidate;
  }
  return text.slice(0, 1);
}

/** Helvetica / WinAnsi : accents OK, pas de typographie exotique. */
function sanitizePdfText(value: string | null | undefined) {
  if (!value) return "";
  return value
    .normalize("NFC")
    .replace(/\u2026/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/€/g, "EUR")
    .replace(/[^\x20-\x7EÀ-ÖØ-öø-ÿ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function joinNonEmpty(
  a: string | null | undefined,
  b: string | null | undefined,
  sep = " "
) {
  return [a, b]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(sep);
}

function formatFrDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR");
}

function formatFrTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function rentalDurationDays(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const ms = end - start;
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return days;
}

export function mapFieldsToPayload(
  fields: Record<string, string | null | undefined>,
  reservation: {
    id: string;
    start_date: string;
    end_date: string;
    pickup_location?: string | null;
    return_location?: string | null;
    total_price?: number | null;
    distance_km?: number | null;
    vehicle_brand?: string | null;
    vehicle_model?: string | null;
    vehicle_label: string;
    vehicle_plate?: string | null;
    vehicle_vin?: string | null;
    vehicle_color?: string | null;
    vehicle_mileage?: number | null;
    deposit?: number | null;
    signed_at_place?: string | null;
  }
): ContractFillPayload {
  const pick = (name: ContractFieldName) => fields[name]?.trim() || "";
  const days = rentalDurationDays(reservation.start_date, reservation.end_date);
  const total = Number(reservation.total_price ?? 0);
  const daily =
    days && days > 0 && total > 0
      ? Math.round((total / days) * 100) / 100
      : null;

  return {
    first_name: pick("first_name"),
    last_name: pick("last_name"),
    birth_date: pick("birth_date"),
    birth_place: pick("birth_place"),
    nationality: pick("nationality"),
    address: pick("address"),
    postal_code: pick("postal_code"),
    city: pick("city"),
    id_document_number: pick("id_document_number"),
    driving_license_number: pick("driving_license_number"),
    driving_license_issue_date: pick("driving_license_issue_date"),
    driving_license_categories: pick("driving_license_categories"),
    proof_of_address_type: pick("proof_of_address_type"),
    proof_of_address_date: pick("proof_of_address_date"),
    phone: pick("phone"),
    email: pick("email"),
    vehicle_brand: reservation.vehicle_brand?.trim() || "",
    vehicle_model: reservation.vehicle_model?.trim() || "",
    vehicle_label: reservation.vehicle_label,
    vehicle_plate: reservation.vehicle_plate ?? "",
    vehicle_vin: reservation.vehicle_vin ?? "",
    vehicle_color: reservation.vehicle_color?.trim() || "",
    vehicle_mileage:
      reservation.vehicle_mileage != null
        ? reservation.vehicle_mileage.toLocaleString("fr-FR")
        : "",
    start_date: formatFrDate(reservation.start_date),
    start_time: formatFrTime(reservation.start_date),
    end_date: formatFrDate(reservation.end_date),
    end_time: formatFrTime(reservation.end_date),
    duration_days: days != null ? String(days) : "",
    daily_rate:
      daily != null ? `${daily.toLocaleString("fr-FR")} EUR` : "",
    pickup_location: reservation.pickup_location ?? "",
    return_location: reservation.return_location ?? "",
    total_price: `${total.toLocaleString("fr-FR")} EUR`,
    deposit: `${Number(reservation.deposit ?? 0).toLocaleString("fr-FR")} EUR`,
    distance_km:
      reservation.distance_km != null
        ? `${reservation.distance_km.toLocaleString("fr-FR")} km`
        : "",
    reservation_id: reservation.id,
    generated_at: new Date().toLocaleString("fr-FR"),
    signed_at_place: reservation.signed_at_place?.trim() || "Beauvais",
  };
}

/** Exposé pour debug / tests unitaires éventuels. */
export function listPayloadFieldLabels() {
  return CONTRACT_FIELD_DEFS.map((d) => d.label);
}
