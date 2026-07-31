import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  icon?: LucideIcon;
  highlight?: boolean;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: Props) {
  return (
    <div className="de-card-inner">
      <div className="flex items-start justify-between gap-2">
        <p className="de-label">{label}</p>
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.75}
            className="shrink-0 text-[var(--blue-soft)] opacity-80"
          />
        )}
      </div>
      <p
        className={`mt-2 text-lg font-medium tracking-tight sm:text-xl ${
          highlight ? "text-[var(--blue-soft)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
