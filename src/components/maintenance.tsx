"use client";

import {
  getMaintenanceTypeBadgeClass,
  getMaintenanceTypeLabel,
} from "@/src/lib/maintenance/type";

type Maintenance = {
  id: string;
  title: string;
  type: string;
  description?: string | null;
  mileage?: number | null;
  maintenance_date?: string | null;
  next_due_date?: string | null;
  cost?: number | null;
  provider?: string | null;
  invoice_url?: string | null;
};

export default function Maintenance({
  maintenances,
}: {
  maintenances: Maintenance[];
}) {
  if (maintenances.length === 0) {
    return <p className="de-empty">Aucun entretien enregistré</p>;
  }

  return (
    <div className="de-list">
      {maintenances.map((item) => (
        <div key={item.id} className="de-list-item space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-medium">{item.title}</h3>
            <span className={`de-badge ${getMaintenanceTypeBadgeClass(item.type)}`}>
              {getMaintenanceTypeLabel(item.type)}
            </span>
          </div>

          {item.description && (
            <p className="text-sm de-muted">{item.description}</p>
          )}

          <div className="grid gap-2 text-xs de-muted sm:grid-cols-3">
            {item.maintenance_date && (
              <div>
                <p className="de-label text-[0.6875rem]">Date</p>
                <p className="mt-0.5 text-sm text-foreground">
                  {new Date(item.maintenance_date).toLocaleDateString("fr-FR")}
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
            {item.next_due_date && (
              <div>
                <p className="de-label text-[0.6875rem]">Prochaine intervention</p>
                <p className="mt-0.5 text-sm text-foreground">
                  {new Date(item.next_due_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
