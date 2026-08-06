import Link from "next/link";
import {
  AlertTriangle,
  Car,
  Calendar,
  FileWarning,
  Wrench,
  MessageSquare,
} from "lucide-react";
import type { AlertItem } from "@/src/lib/admin/dashboard-data";

const ICONS = {
  vehicle_unavailable: Car,
  reservation_today: Calendar,
  document_expiring: FileWarning,
  maintenance_due: Wrench,
  contact_lead: MessageSquare,
} as const;

function AlertContent({
  alert,
  Icon,
}: {
  alert: AlertItem;
  Icon: (typeof ICONS)[keyof typeof ICONS];
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
          alert.priority === "high"
            ? "border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-[color-mix(in_srgb,var(--destructive)_8%,transparent)]"
            : "border-[var(--blue-border)] bg-[var(--bg)]"
        }`}
      >
        {alert.priority === "high" ? (
          <AlertTriangle
            size={16}
            strokeWidth={1.75}
            className="text-[var(--destructive)]"
          />
        ) : (
          <Icon
            size={16}
            strokeWidth={1.75}
            className="text-[var(--blue-soft)]"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{alert.title}</p>
        {alert.description && (
          <p className="mt-0.5 text-sm de-muted">{alert.description}</p>
        )}
      </div>
    </div>
  );
}

export default function AlertPanel({ alerts }: { alerts: AlertItem[] }) {
  if (alerts.length === 0) {
    return (
      <p className="de-empty">
        Aucune alerte — tout est en ordre
      </p>
    );
  }

  return (
    <div className="de-list">
      {alerts.map((alert) => {
        const Icon = ICONS[alert.type];
        const className = `de-list-item block ${
          alert.priority === "high"
            ? "border-[color-mix(in_srgb,var(--destructive)_40%,transparent)]"
            : ""
        } ${alert.href ? "transition hover:border-[var(--blue-soft)]" : ""}`;

        if (alert.href) {
          return (
            <Link key={alert.id} href={alert.href} className={className}>
              <AlertContent alert={alert} Icon={Icon} />
            </Link>
          );
        }

        return (
          <div key={alert.id} className={className}>
            <AlertContent alert={alert} Icon={Icon} />
          </div>
        );
      })}
    </div>
  );
}
