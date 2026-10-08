import { getPendingPayouts } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";
import PayoutsClient from "./PayoutsClient";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const pending = await getPendingPayouts();
  const total = pending.reduce((s, p) => s + p.amount, 0);
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-3xl">Payouts</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {pending.length} payout{pending.length === 1 ? "" : "s"} awaiting review ·{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(total)}</span> total
          </p>
        </div>
      </div>
      <PayoutsClient initial={pending} />
    </div>
  );
}
