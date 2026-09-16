/** Message WhatsApp prérempli pour une demande propriétaire. */

export function buildOwnerWhatsAppMessage({
  firstName,
  lastName,
  vehicle,
}: {
  firstName: string;
  lastName: string;
  vehicle: string;
}) {
  const name = `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
  const vehicleLabel = vehicle.trim();

  return `Bonjour, je suis ${name}, je souhaite mettre à disposition mon ${vehicleLabel}.`;
}

/** Corps enregistré côté admin (véhicule + message libre optionnel). */
export function buildOwnerAdminMessage({
  vehicle,
  message,
}: {
  vehicle: string;
  message: string;
}) {
  const vehicleLine = `Véhicule : ${vehicle.trim()}`;
  const freeText = message.trim();

  if (!freeText) {
    return vehicleLine;
  }

  return `${vehicleLine}\n\n${freeText}`;
}
