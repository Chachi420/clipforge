"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { markPayoutPaid, type PendingPayout } from "@/lib/admin-actions";
import { PAYOUT_METHOD_LABELS } from "@/lib/types";
import { formatCompact, formatMoney } from "@/lib/format";

export default function PayoutsClient({ initial }: { initial: PendingPayout[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleMarkPaid(id: string, amount: number) {
    if (
      !confirm(
        `Mark this payout as PAID for ${formatMoney(amount)}? Only do this after the money has actually been sent.`
      )
    )
      return;
    setBusy(id);
    setError(null);
    try {
      await markPayoutPaid(id);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Mark paid failed.");
    } finally {
      setBusy(null);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="Nothing to pay" body="No payouts are awaiting your review." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300">{error}</p>
      )}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Campaign · Cycle</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Stats</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/10">
            {initial.map((p) => (
              <tr key={p.id} className="transition hover:bg-ink/[0.03]">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{p.displayName}</div>
                  <div className="text-xs text-ink-faint">{p.userEmail}</div>
                </td>
                <td className="px-4 py-3 text-ink">
                  {p.campaignName} <span className="text-ink-faint">#{p.cycleNumber}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{p.period}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {formatCompact(p.totalViews)} views · {p.totalClips} clips
                </td>
                <td className="px-4 py-3">
                  {p.method ? (
                    <Badge tone="blue">
                      {PAYOUT_METHOD_LABELS[p.method as keyof typeof PAYOUT_METHOD_LABELS] ?? p.method}
                    </Badge>
                  ) : (
                    <span className="text-xs text-ink-faint">Not set</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(p.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    onClick={() => handleMarkPaid(p.id, p.amount)}
                    disabled={busy === p.id}
                    className="!px-3 !py-1.5 text-xs"
                  >
                    <Check size={14} /> {busy === p.id ? "…" : "Mark paid"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-ink-faint">
        Marking paid sets the payout&apos;s final amount to its estimate and flips its status
        to paid. Only mark paid after the money has actually left your account.
      </p>
    </div>
  );
}
