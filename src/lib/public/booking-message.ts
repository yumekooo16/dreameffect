import { formatDateShortFr } from "@/src/lib/dates/calendar-utils";

export function buildBookingWhatsAppMessage({
  vehicleName,
  startDate,
  endDate,
  durationDays,
  estimateLabel,
  estimateTotal,
  deposit,
}: {
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  durationDays?: number | null;
  estimateLabel?: string | null;
  estimateTotal?: string | null;
  deposit?: string | null;
}) {
  const lines = [
    "Bonjour DreamEffect,",
    "",
    `Je souhaiterais réserver la ${vehicleName}.`,
    "",
    `Date de début : ${formatDateShortFr(startDate)}`,
    `Date de fin : ${formatDateShortFr(endDate)}`,
  ];

  if (durationDays != null && durationDays > 0) {
    lines.push(
      `Durée : ${durationDays} ${durationDays === 1 ? "jour" : "jours"}`
    );
  }

  if (estimateTotal) {
    lines.push(
      `Estimation${estimateLabel ? ` (${estimateLabel})` : ""} : ${estimateTotal}`
    );
  }

  if (deposit) {
    lines.push(`Caution indiquée : ${deposit}`);
  }

  lines.push(
    "",
    "Documents prêts : pièce d'identité, permis, justificatif de domicile (-3 mois).",
    "",
    "Pouvez-vous me confirmer la disponibilité et les modalités ?",
    "",
    "Merci."
  );

  return lines.join("\n");
}
