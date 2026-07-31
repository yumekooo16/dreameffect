import Link from "next/link";
import type { VehicleMaintenanceRow } from "@/src/lib/admin/vehicles-types";
import {
  getMaintenanceTypeBadgeClass,
  getMaintenanceTypeLabel,
} from "@/src/lib/maintenance/type";

export default function VehicleMaintenanceSection({
  maintenances,
  vehicleId,
}: {
  maintenances: VehicleMaintenanceRow[];
  vehicleId: string;
}) {
  return (
    <div className="space-y-4">
      {maintenances.length === 0 ? (
        <p className="de-empty">Aucune intervention enregistrée</p>
      ) : (
        <div className="de-list">
          {maintenances.map((item) => (
            <Link
              key={item.id}
              href={`/admin/maintenance/${item.id}`}
              className="de-list-item block transition hover:border-[var(--blue-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <span
                  className={`de-badge ${getMaintenanceTypeBadgeClass(item.type)}`}
                >
                  {getMaintenanceTypeLabel(item.type)}
                </span>
              </div>

              <div className="grid gap-2 text-xs sm:grid-cols-4">
                {item.maintenance_date && (
                  <div>
                    <p className="de-label text-[0.6875rem]">Date</p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {new Date(item.maintenance_date).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                )}
                {item.mileage != null && (
                  <div>
                    <p className="de-label text-[0.6875rem]">Kilométrage</p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {item.mileage.toLocaleString("fr-FR")} km
                    </p>
                  </div>
                )}
                {item.cost != null && (
                  <div>
                    <p className="de-label text-[0.6875rem]">Coût</p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {Number(item.cost).toLocaleString("fr-FR")} €
                    </p>
                  </div>
                )}
                {item.provider && (
                  <div>
                    <p className="de-label text-[0.6875rem]">Prestataire</p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {item.provider}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/maintenance/nouveau?vehicule=${vehicleId}`}
          className="de-btn de-btn-primary inline-flex text-sm"
        >
          Ajouter une intervention
        </Link>
        <Link
          href={`/admin/maintenance?vehicule=${vehicleId}`}
          className="de-btn de-btn-ghost inline-flex text-sm"
        >
          Gestion maintenance →
        </Link>
      </div>
    </div>
  );
}
