import {
  getVehicleStatusBadgeClass,
  getVehicleStatusLabel,
} from "@/src/lib/vehicles/status";

export default function VehicleStatusBadge({
  status,
}: {
  status?: string | null;
}) {
  return (
    <span className={`de-badge ${getVehicleStatusBadgeClass(status)}`}>
      {getVehicleStatusLabel(status)}
    </span>
  );
}
