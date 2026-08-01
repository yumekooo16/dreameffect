import {
  COMPANY_REVENUE_SHARE_PERCENT,
  OWNER_REVENUE_SHARE_PERCENT,
  formatEuro,
} from "@/src/lib/revenue/split";

type RevenueSplitCardProps = {
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
  title?: string;
  compact?: boolean;
};

export default function RevenueSplitCard({
  totalRevenue,
  ownerShare,
  companyShare,
  title = "Répartition des revenus",
  compact = false,
}: RevenueSplitCardProps) {
  const ownerPercent =
    totalRevenue > 0 ? Math.round((ownerShare / totalRevenue) * 100) : OWNER_REVENUE_SHARE_PERCENT;
  const companyPercent =
    totalRevenue > 0
      ? Math.round((companyShare / totalRevenue) * 100)
      : COMPANY_REVENUE_SHARE_PERCENT;

  return (
    <div className={`de-revenue-split ${compact ? "de-revenue-split--compact" : ""}`}>
      <div className="de-revenue-split__header">
        <p className="de-label">{title}</p>
        <p className="de-revenue-split__total">{formatEuro(totalRevenue)}</p>
        <p className="de-revenue-split__hint">
          Répartition automatique — {OWNER_REVENUE_SHARE_PERCENT}&nbsp;% propriétaire ·{" "}
          {COMPANY_REVENUE_SHARE_PERCENT}&nbsp;% DreamEffect
        </p>
      </div>

      <div className="de-revenue-split__bar" aria-hidden>
        <span
          className="de-revenue-split__bar-owner"
          style={{ width: `${ownerPercent}%` }}
        />
        <span
          className="de-revenue-split__bar-company"
          style={{ width: `${companyPercent}%` }}
        />
      </div>

      <div className="de-revenue-split__grid">
        <div className="de-revenue-split__item de-revenue-split__item--owner">
          <p className="de-label">Votre part</p>
          <p className="de-revenue-split__amount">{formatEuro(ownerShare)}</p>
          <p className="de-revenue-split__percent">{ownerPercent}&nbsp;%</p>
        </div>
        <div className="de-revenue-split__item de-revenue-split__item--company">
          <p className="de-label">Part DreamEffect</p>
          <p className="de-revenue-split__amount">{formatEuro(companyShare)}</p>
          <p className="de-revenue-split__percent">{companyPercent}&nbsp;%</p>
        </div>
      </div>
    </div>
  );
}
