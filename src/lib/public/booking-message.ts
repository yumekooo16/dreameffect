import { formatDateShortFr } from "@/src/lib/dates/calendar-utils";

export function buildBookingWhatsAppMessage({
  vehicleName,
  startDate,
  endDate,
}: {
  vehicleName: string;
  startDate: Date;
  endDate: Date;
}) {
  return [
    "Bonjour,",
    "",
    `Je souhaiterais réserver la ${vehicleName}.`,
    "",
    "Date de début :",
    formatDateShortFr(startDate),
    "",
    "Date de fin :",
    formatDateShortFr(endDate),
    "",
    "Pouvez-vous me communiquer les modalités de réservation ?",
    "",
    "Merci.",
  ].join("\n");
}
