import { requireBrand } from "@/lib/brand-actions";
import { getBrandBalance, getBrandTopups } from "@/lib/brand-db";
import { Card, EmptyState, Stat } from "@/components/ui";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { brand } = await requireBrand();
  const [balance, topups] = await Promise.all([
    getBrandBalance(brand.id),
    getBrandTopups(brand.id),
  ]);

  return (
    <div className="space-y-6 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-white/50">
          Funds, spend and top-up history. All amounts in USD.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <Stat label="Total funded" value={formatMoney(balance.funded)} />
        </Card>
        <Card className="p-6">
          <Stat label="Total spend" value={formatMoney(balance.spent)} />
        </Card>
        <Card
          className={`p-6 ${balance.balance < 0 ? "border-red-500/40" : "border-emerald-500/40"}`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Available balance
          </div>
          <div
            className={`mt-1 text-2xl font-bold ${balance.balance < 0 ? "text-red-400" : "text-emerald-400"}`}
          >
            {formatMoney(balance.balance)}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-white">Add funds</h2>
        <p className="mt-2 max-w-xl text-sm text-white/60">
          Top-ups are arranged with your account manager — there are no automated
          payments in v1. Once funds are received, an admin records the top-up and
          it appears in your ledger below.
        </p>
        <p className="mt-3 text-sm text-white/80">
          Email{" "}
          <a
            href="mailto:billing@clipforge.example"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-2"
          >
            billing@clipforge.example
          </a>{" "}
          to arrange a top-up.
        </p>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-bold text-white">Top-up history</h2>
        {topups.length === 0 ? (
          <EmptyState title="No top-ups recorded yet." body="Funded amounts will appear here once your account manager records a top-up." />
        ) : (
          <div className="overflow-x-auto overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {topups.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/70">{t.createdAt.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      {formatMoney(t.amount)}
                    </td>
                    <td className="px-4 py-3 capitalize text-white/70">
                      {t.method ?? <span className="text-xs text-white/35">—</span>}
                    </td>
                    <td className="px-4 py-3 text-white/55">
                      {t.reference ?? <span className="text-xs text-white/35">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
