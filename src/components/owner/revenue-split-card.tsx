import {
  COMPANY_REVENUE_SHARE_PERCENT,
  OWNER_REVENUE_SHARE_PERCENT,
  formatEuro,
  revenueModeLabel,
  type RevenueMode,
} from "@/src/lib/revenue/split";

type RevenueSplitCardProps = {
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
  title?: string;
  compact?: boolean;
  revenueMode?: RevenueMode | null;
};

export default function RevenueSplitCard({
  totalRevenue,
  ownerShare,
  companyShare,
  title = "Répartition des revenus",
  compact = false,
  revenueMode = "percentage",
}: RevenueSplitCardProps) {
  const mode = revenueMode ?? "percentage";
  const ownerPercent =
    totalRevenue > 0
      ? Math.round((ownerShare / totalRevenue) * 100)
      : OWNER_REVENUE_SHARE_PERCENT;
  const companyPercent =
    totalRevenue > 0
      ? Math.round((companyShare / totalRevenue) * 100)
      : COMPANY_REVENUE_SHARE_PERCENT;

  const hint =
    mode === "pro_price"
      ? "Répartition automatique — grille prix pro (+ km supp.) · marge DreamEffect"
      : `Répartition automatique — ${OWNER_REVENUE_SHARE_PERCENT} % propriétaire · ${COMPANY_REVENUE_SHARE_PERCENT} % DreamEffect`;

  return (
    <div className={`de-revenue-split ${compact ? "de-revenue-split--compact" : ""}`}>
      <div className="de-revenue-split__header">
        <p className="de-label">{title}</p>
        <p className="de-revenue-split__total">{formatEuro(totalRevenue)}</p>
        <p className="de-revenue-split__hint">
          {hint}
          <span className="ml-1 opacity-80">({revenueModeLabel(mode)})</span>
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
          <p className="de-revenue-split__percent">
            {mode === "pro_price" ? "Prix pro" : `${ownerPercent} %`}
          </p>
        </div>
        <div className="de-revenue-split__item de-revenue-split__item--company">
          <p className="de-label">Part DreamEffect</p>
          <p className="de-revenue-split__amount">{formatEuro(companyShare)}</p>
          <p className="de-revenue-split__percent">
            {mode === "pro_price" ? "Marge" : `${companyPercent} %`}
          </p>
        </div>
      </div>
    </div>
  );
}
