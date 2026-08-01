import { formatEuro } from "@/src/lib/revenue/split";

type DailyEntry = {
  ledger_date: string;
  owner_amount: number;
  daily_total: number;
};

export default function DailyRevenueFeed({ entries }: { entries: DailyEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm de-muted">
        Les revenus journaliers apparaîtront ici dès qu&apos;une location confirmée
        est en cours.
      </p>
    );
  }

  return (
    <div className="de-list">
      {entries.map((entry) => (
        <div
          key={entry.ledger_date}
          className="de-list-item flex flex-wrap items-center justify-between gap-2"
        >
          <div>
            <p className="text-sm font-medium">
              {new Date(entry.ledger_date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="mt-0.5 text-xs de-muted">
              CA journalier {formatEuro(Number(entry.daily_total))}
            </p>
          </div>
          <p className="text-sm font-medium text-[var(--blue-soft)]">
            +{formatEuro(Number(entry.owner_amount))}
          </p>
        </div>
      ))}
    </div>
  );
}
