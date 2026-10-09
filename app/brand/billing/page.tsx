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
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Billing</h1>
        <p className="mt-1 text-sm text-ink-soft">
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
          className={`p-6 ${balance.balance < 0 ? "border-red-500/40" : "border-electric-deep/40"}`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Available balance
          </div>
          <div
            className={`mt-1 font-display text-3xl font-bold ${balance.balance < 0 ? "text-red-600 dark:text-red-400" : "text-electric-deep dark:text-electric-soft"}`}
          >
            {formatMoney(balance.balance)}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-bold text-ink">Add funds</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Top-ups are arranged with your account manager — there are no automated
          payments in v1. Once funds are received, an admin records the top-up and
          it appears in your ledger below.
        </p>
        <p className="mt-3 text-sm text-ink">
          Email{" "}
          <a
            href="mailto:billing@clipforge.example"
            className="font-semibold text-electric-deep underline decoration-electric-deep/40 underline-offset-2"
          >
            billing@clipforge.example
          </a>{" "}
          to arrange a top-up.
        </p>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Top-up history</h2>
        {topups.length === 0 ? (
          <EmptyState title="No top-ups recorded yet." body="Funded amounts will appear here once your account manager records a top-up." />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-[11px] uppercase tracking-wider text-ink-faint">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {topups.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-ink-soft">{t.createdAt.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(t.amount)}
                      </td>
                      <td className="px-4 py-3 capitalize text-ink-soft">
                        {t.method ?? <span className="text-xs text-ink-faint">—</span>}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {t.reference ?? <span className="text-xs text-ink-faint">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
