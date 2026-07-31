export type MaintenanceType =
  | "oil_change"
  | "service"
  | "tires"
  | "brakes"
  | "repair"
  | "technical_control"
  | "inspection"
  | "other";

export const MAINTENANCE_TYPES = [
  { value: "oil_change" as const, label: "Vidange" },
  { value: "service" as const, label: "Révision" },
  { value: "tires" as const, label: "Pneus" },
  { value: "brakes" as const, label: "Freins" },
  { value: "repair" as const, label: "Réparation" },
  { value: "technical_control" as const, label: "Contrôle technique" },
  { value: "inspection" as const, label: "Inspection" },
  { value: "other" as const, label: "Autre" },
];

export type MaintenanceDueStatus =
  | "overdue"
  | "due_soon"
  | "scheduled"
  | "no_due";

export const MAINTENANCE_DUE_FILTERS = [
  { value: "all", label: "Tous les statuts" },
  { value: "overdue", label: "Échéance dépassée" },
  { value: "due_soon", label: "Échéance proche" },
  { value: "scheduled", label: "Échéance planifiée" },
  { value: "no_due", label: "Sans échéance" },
] as const;

export type MaintenanceDueFilter =
  (typeof MAINTENANCE_DUE_FILTERS)[number]["value"];

const TYPE_LABELS: Record<MaintenanceType, string> = Object.fromEntries(
  MAINTENANCE_TYPES.map((t) => [t.value, t.label])
) as Record<MaintenanceType, string>;

const TYPE_BADGES: Record<MaintenanceType, string> = {
  oil_change: "de-badge--confirmed",
  service: "de-badge--finished",
  tires: "de-badge--pending",
  brakes: "de-badge--pending",
  repair: "de-badge--cancelled",
  technical_control: "de-badge--confirmed",
  inspection: "de-badge--confirmed",
  other: "de-badge--finished",
};

const DUE_LABELS: Record<MaintenanceDueStatus, string> = {
  overdue: "Échéance dépassée",
  due_soon: "Échéance proche",
  scheduled: "Échéance planifiée",
  no_due: "Sans échéance",
};

const DUE_BADGES: Record<MaintenanceDueStatus, string> = {
  overdue: "de-badge--cancelled",
  due_soon: "de-badge--pending",
  scheduled: "de-badge--confirmed",
  no_due: "de-badge--finished",
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DUE_SOON_DAYS = 30;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMaintenanceTypeLabel(type: string) {
  return TYPE_LABELS[type as MaintenanceType] ?? type;
}

export function getMaintenanceTypeBadgeClass(type: string) {
  return TYPE_BADGES[type as MaintenanceType] ?? "de-badge--finished";
}

export function getMaintenanceDueStatus(
  nextDueDate?: string | null
): MaintenanceDueStatus {
  if (!nextDueDate) return "no_due";

  const today = startOfDay(new Date());
  const due = startOfDay(new Date(nextDueDate));

  if (due < today) return "overdue";

  const in30Days = new Date(today.getTime() + DUE_SOON_DAYS * MS_PER_DAY);
  if (due <= in30Days) return "due_soon";

  return "scheduled";
}

export function getMaintenanceDueLabel(nextDueDate?: string | null) {
  return DUE_LABELS[getMaintenanceDueStatus(nextDueDate)];
}

export function getMaintenanceDueBadgeClass(nextDueDate?: string | null) {
  return DUE_BADGES[getMaintenanceDueStatus(nextDueDate)];
}

export function isMaintenanceDueSoon(nextDueDate?: string | null) {
  const status = getMaintenanceDueStatus(nextDueDate);
  return status === "due_soon" || status === "overdue";
}
