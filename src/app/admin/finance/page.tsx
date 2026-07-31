import Link from "next/link";
import { requireAdmin } from "@/src/lib/admin/auth";
import Section from "@/src/components/owner/section";
import FinancePanel from "@/src/components/admin/finance-panel";
import {
  fetchFinanceData,
  fetchOwnersForPayoutForm,
} from "@/src/lib/admin/finance-data";

export default async function AdminFinancePage() {
  await requireAdmin();

  const [data, payoutOwners] = await Promise.all([
    fetchFinanceData(),
    fetchOwnersForPayoutForm(),
  ]);

  const vehicleOwners = Object.fromEntries(data.vehicleOwners);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm de-muted transition hover:text-foreground"
        >
          ← Tableau de bord
        </Link>
        <h1 className="de-display mt-4 text-2xl sm:text-3xl tracking-tight">
          Finance
        </h1>
        <p className="mt-1 text-sm de-muted">
          Pilotage financier — revenus, commissions et reversements
        </p>
      </div>

      <Section title="Tableau de bord financier">
        <FinancePanel
          stats={data.stats}
          monthlyRevenues={data.monthlyRevenues}
          monthlyCommissions={data.monthlyCommissions}
          vehicleFinance={data.vehicleFinance}
          ownerFinance={data.ownerFinance}
          history={data.history}
          payouts={data.payouts}
          filterOptions={data.filterOptions}
          reservations={data.reservations}
          vehicleOwners={vehicleOwners}
          payoutOwners={payoutOwners}
        />
      </Section>
    </div>
  );
}
