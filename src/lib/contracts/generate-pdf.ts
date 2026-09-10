import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  CONTRACT_FIELD_DEFS,
  type ContractFieldName,
} from "@/src/lib/contracts/fields";

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
  vehicle_label: string;
  vehicle_plate: string;
  vehicle_vin: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  return_location: string;
  total_price: string;
  deposit: string;
  distance_km: string;
  reservation_id: string;
  generated_at: string;
};

export const CONTRACT_TEMPLATE_VERSION = "official-placeholders-v1";

/**
 * IMPORTANT JURIDIQUE
 * -------------------
 * Ce générateur NE rédige PAS le contrat.
 * Il produit un PDF de saisie des variables à reporter sur le modèle avocat.
 *
 * Pour brancher le contrat officiel DreamEffect :
 * 1. Déposer le DOCX/PDF avocat avec placeholders {{first_name}}, etc.
 * 2. Remplacer cette fonction par un remplissage de ce modèle.
 * 3. Ne jamais laisser un LLM réécrire clauses / conditions.
 */
export async function buildFilledContractPdf(
  payload: ContractFillPayload
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595.28, 841.89]);
  const margin = 48;
  let y = 800;

  const draw = (
    text: string,
    options?: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb> }
  ) => {
    const size = options?.size ?? 11;
    const usedFont = options?.bold ? fontBold : font;
    const maxWidth = 595.28 - margin * 2;
    const words = text.split(/\s+/);
    let line = "";

    const flush = () => {
      if (!line) return;
      if (y < 60) {
        page = pdf.addPage([595.28, 841.89]);
        y = 800;
      }
      page.drawText(line, {
        x: margin,
        y,
        size,
        font: usedFont,
        color: options?.color ?? rgb(0.1, 0.1, 0.1),
        maxWidth,
      });
      y -= size + 6;
      line = "";
    };

    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (usedFont.widthOfTextAtSize(next, size) > maxWidth) {
        flush();
        line = word;
      } else {
        line = next;
      }
    }
    flush();
  };

  draw("DREAMEFFECT — FICHE DE REMPLISSAGE CONTRAT", {
    bold: true,
    size: 16,
  });
  draw(
    "Document généré automatiquement. Les clauses juridiques du contrat avocat ne sont pas modifiées ici.",
    { size: 9, color: rgb(0.35, 0.35, 0.35) }
  );
  draw(`Modèle variables : ${CONTRACT_TEMPLATE_VERSION}`, {
    size: 9,
    color: rgb(0.35, 0.35, 0.35),
  });
  y -= 8;

  draw("1. INFORMATIONS LOCATION (réservation)", { bold: true, size: 13 });
  draw(`Réservation : ${payload.reservation_id}`);
  draw(`Véhicule : ${payload.vehicle_label}`);
  draw(`Immatriculation : ${payload.vehicle_plate || "—"}`);
  draw(`VIN : ${payload.vehicle_vin || "—"}`);
  draw(`Départ : ${payload.start_date} — ${payload.pickup_location || "—"}`);
  draw(`Retour : ${payload.end_date} — ${payload.return_location || "—"}`);
  draw(`Tarif : ${payload.total_price}`);
  draw(`Caution : ${payload.deposit}`);
  draw(`Kilométrage prévu / relevé : ${payload.distance_km || "—"}`);
  y -= 10;

  draw("2. INFORMATIONS LOCATAIRE (validées admin)", { bold: true, size: 13 });
  for (const def of CONTRACT_FIELD_DEFS) {
    const value = payload[def.name] || "—";
    draw(`${def.label} : ${value}`);
  }
  y -= 10;

  draw("3. MODE D'EMPLOI JURIDIQUE", { bold: true, size: 13 });
  draw(
    "Reporter ces valeurs dans le contrat officiel DreamEffect validé par l'avocat, uniquement dans les champs variables prévus (ex. {{last_name}}, {{vehicle_plate}})."
  );
  draw(
    "Interdiction : ne pas laisser une IA rédiger, reformuler ou supprimer une clause."
  );
  draw(`Généré le : ${payload.generated_at}`);

  return pdf.save();
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
    vehicle_label: string;
    vehicle_plate?: string | null;
    vehicle_vin?: string | null;
    deposit?: number | null;
  }
): ContractFillPayload {
  const pick = (name: ContractFieldName) => fields[name]?.trim() || "";

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
    vehicle_label: reservation.vehicle_label,
    vehicle_plate: reservation.vehicle_plate ?? "",
    vehicle_vin: reservation.vehicle_vin ?? "",
    start_date: new Date(reservation.start_date).toLocaleString("fr-FR"),
    end_date: new Date(reservation.end_date).toLocaleString("fr-FR"),
    pickup_location: reservation.pickup_location ?? "",
    return_location: reservation.return_location ?? "",
    total_price: `${Number(reservation.total_price ?? 0).toLocaleString("fr-FR")} €`,
    deposit: `${Number(reservation.deposit ?? 0).toLocaleString("fr-FR")} €`,
    distance_km:
      reservation.distance_km != null
        ? `${reservation.distance_km.toLocaleString("fr-FR")} km`
        : "",
    reservation_id: reservation.id,
    generated_at: new Date().toLocaleString("fr-FR"),
  };
}
