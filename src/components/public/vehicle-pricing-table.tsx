import type { VehiclePricing } from "@/src/lib/vehicles/pricing";
import {
  PRICING_TIER_FIELDS,
  formatPrice,
} from "@/src/lib/vehicles/pricing";

export default function VehiclePricingTable({
  pricing,
}: {
  pricing: VehiclePricing;
}) {
  const rentalTiers = PRICING_TIER_FIELDS.filter((tier) => tier.key !== "deposit")
    .map((tier) => ({
      ...tier,
      value: pricing[tier.key],
    }))
    .filter((tier) => tier.value != null && tier.value > 0);

  const deposit = pricing.deposit;

  if (rentalTiers.length === 0 && !deposit) {
    return (
      <div className="de-pricing-table de-pricing-table--empty">
        <p className="de-label">Tarifs</p>
        <p className="mt-2 text-sm de-muted">Tarifs communiqués sur demande</p>
      </div>
    );
  }

  return (
    <div className="de-pricing-table">
      <h2 className="de-display text-lg">Tarifs</h2>

      {rentalTiers.length > 0 && (
        <ul className="de-pricing-list">
          {rentalTiers.map((tier) => (
            <li key={tier.key} className="de-pricing-row">
              <div>
                <p className="de-pricing-row-label">{tier.label}</p>
                {tier.hint && (
                  <p className="de-pricing-row-hint">{tier.hint}</p>
                )}
              </div>
              <p className="de-pricing-row-value">{formatPrice(tier.value)}</p>
            </li>
          ))}
        </ul>
      )}

      {deposit != null && deposit > 0 && (
        <div className="de-pricing-deposit">
          <div>
            <p className="de-pricing-row-label">Caution</p>
            <p className="de-pricing-row-hint">Restituée à la restitution du véhicule</p>
          </div>
          <p className="de-pricing-row-value">{formatPrice(deposit)}</p>
        </div>
      )}
    </div>
  );
}
