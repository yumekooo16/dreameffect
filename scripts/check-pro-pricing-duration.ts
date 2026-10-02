/**
 * Vérifie le calcul des périodes 24 h / marge prix pro.
 * Usage : npx tsx scripts/check-pro-pricing-duration.ts
 */

import {
  computeProOwnerPayout,
  isWeekendDominantRental,
  normalizeVehicleProPricing,
} from "../src/lib/revenue/pro-pricing";
import { countBillableRentalDays } from "../src/lib/dates/calendar-utils";
import { splitRevenueForContext } from "../src/lib/revenue/split";

const pricing = normalizeVehicleProPricing({
  pro_price_24h_weekday: 70,
  pro_price_24h_weekend: 120,
  pro_price_48h_weekend: 200,
  pro_price_72h_weekend: 300,
  pro_price_7_days: 500,
});

function assert(cond: boolean, message: string) {
  if (!cond) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${message}`);
  }
}

// Mercredi 10:00 → vendredi 10:00 = 48 h = 2 × 24 h (pas 3 jours calendaires)
const wed = "2026-10-07T10:00:00";
const fri = "2026-10-09T10:00:00";

assert(countBillableRentalDays(wed, fri) === 2, "mer 10h → ven 10h = 2 périodes");
assert(!isWeekendDominantRental(wed, fri), "mer→ven n'est pas week-end dominant");

const payout = computeProOwnerPayout(pricing, wed, fri, null);
assert(payout?.rentalDays === 2, `rentalDays=2 (reçu ${payout?.rentalDays})`);
assert(payout?.baseAmount === 140, `prix pro = 2×70 = 140 (reçu ${payout?.baseAmount})`);
assert(
  payout?.tierLabel === "2 × 24 h semaine",
  `label « 2 × 24 h semaine » (reçu ${payout?.tierLabel})`
);

// CA client 220 € → marge DreamEffect = 80 € (pas 10 € avec l'ancien bug 3×70)
const split = splitRevenueForContext(220, {
  mode: "pro_price",
  startDate: wed,
  endDate: fri,
  proPricing: pricing,
});
assert(split.ownerAmount === 140, `ownerAmount=140 (reçu ${split.ownerAmount})`);
assert(split.companyAmount === 80, `marge=80 (reçu ${split.companyAmount})`);

// Vendredi 10:00 → dimanche 10:00 = 48 h week-end
const friStart = "2026-10-09T10:00:00";
const sun = "2026-10-11T10:00:00";
assert(countBillableRentalDays(friStart, sun) === 2, "ven 10h → dim 10h = 2");
assert(isWeekendDominantRental(friStart, sun), "ven→dim week-end dominant");
const weekendPayout = computeProOwnerPayout(pricing, friStart, sun, null);
assert(
  weekendPayout?.baseAmount === 200,
  `48 h week-end = 200 (reçu ${weekendPayout?.baseAmount})`
);

if (process.exitCode) {
  console.error("\nÉchecs détectés.");
  process.exit(1);
}
console.log("\nTous les contrôles passent.");
