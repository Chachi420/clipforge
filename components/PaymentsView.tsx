"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { Badge, Button, Card, Dialog, EmptyState, Field, NightCard, Stat, inputCls } from "@/components/ui";
import { addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } from "@/lib/actions";
import { PAYOUT_METHOD_LABELS, type PaymentMethodRow, type PayoutCycle, type PayoutMethod } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const STATUS_LABEL: Record<PayoutCycle["status"], string> = {
  live: "Live", pending_review: "Pending", awaiting_mark_paid: "Awaiting admin Mark Paid", paid: "Paid",
};

const METHOD_OPTIONS: PayoutMethod[] = ["paypal", "usdt_eth", "usdc_eth"];

export default function PaymentsView({
  cycles, methods,
}: {
  cycles: PayoutCycle[]; methods: PaymentMethodRow[];
}) {
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [mType, setMType] = useState<PayoutMethod>("paypal");
  const [mId, setMId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const receipt = cycles.find((c) => c.id === receiptId);

  const awaiting = cycles.filter((c) => c.status === "awaiting_mark_paid");
  const awaitingTotal = awaiting.reduce((s, c) => s + c.estimatedAmount, 0);
  const live = cycles.find((c) => c.status === "live");
  const history = cycles.filter((c) => c.status !== "live");

  function handleExport() {
    const header = ["Cycle", "Status", "Period", "Verified views", "Clips", "Amount (USD)"];
    const lines = history.map((c) => [
      `${c.campaignName} #${c.cycleNumber}`,
      STATUS_LABEL[c.status],
      c.snapshotAt ? `Snapshotted ${c.snapshotAt}` : `${c.periodStart} to ${c.periodEnd}`,
      String(c.totalViews),
      String(c.totalClips),
      c.estimatedAmount.toFixed(2),
    ]);
    const csv = [header, ...lines]
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "clipforge-payout-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAdd() {
    setSaving(true);
    setError(null);
    try {
      await addPaymentMethod(mType, mId);
      setShowAdd(false);
      setMId("");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Could not add payment method.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this payment method?")) return;
    try {
      await deletePaymentMethod(id);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Could not remove.");
    }
  }

  async function handleDefault(id: string) {
    try {
      await setDefaultPaymentMethod(id);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Could not update.");
    }
  }

  return (
    <>
      <Header
        title="Payments"
        subtitle="Manage your earnings and payment methods"
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add payment method
          </Button>
        }
      />
      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <NightCard className="p-5">
            <Stat dark label="Est. payout" value={live ? formatMoney(live.estimatedAmount) : "$0.00"} sub="Current cycle estimate" />
          </NightCard>
          <Card className="p-5">
            <Stat label="Active campaigns" value={`${awaiting.length}`} sub="With pending payouts" />
          </Card>
          <Card className="p-5">
            <Stat label="Payout history" value={`${cycles.filter((c) => c.status === "paid").length} paid`} sub="Lifetime payouts received" />
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-ink">Payment methods</h3>
          </div>
          {methods.length === 0 ? (
            <EmptyState
              title="No payment methods yet"
              body="Add one to receive payouts — PayPal or crypto (USDT/USDC on Ethereum)."
            />
          ) : (
            <div className="space-y-2">
              {methods.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 rounded-card border border-line/10 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      {PAYOUT_METHOD_LABELS[m.type]}
                      {m.isDefault && <Badge tone="default">Default</Badge>}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-xs text-ink-faint">{m.masked}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!m.isDefault && (
                      <button onClick={() => handleDefault(m.id)} className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-ink/10">
                        Set default
                      </button>
                    )}
                    <button onClick={() => handleDelete(m.id)} className="rounded-full bg-ink/5 p-2 text-status-error hover:bg-ink/10" aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-bold text-ink">Payout history</h3>
            <Button variant="ghost" onClick={handleExport} disabled={history.length === 0}>
              <Download size={15} /> Export CSV
            </Button>
          </div>
          {awaitingTotal > 0 && (
            <div className="mb-4 rounded-card border border-status-warning/30 bg-status-warning/10 p-4 text-sm">
              <span className="tnum font-bold text-status-warning">{formatMoney(awaitingTotal)}</span>
              <span className="text-ink-soft"> awaiting payout — {awaiting.length} cycle{awaiting.length === 1 ? "" : "s"} awaiting Mark Paid</span>
            </div>
          )}
          {history.length === 0 ? (
            <EmptyState
              title="No payouts yet"
              body="Submit clips to a campaign and your earnings will appear here after each cycle closes."
            />
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="space-y-2 md:hidden">
                {history.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setReceiptId(c.id)}
                    className="w-full rounded-card border border-line/10 bg-surface p-4 text-left transition-colors hover:bg-ink/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-semibold text-ink">{c.campaignName} #{c.cycleNumber}</div>
                      <Badge tone={c.status === "paid" ? "success" : "warning"}>{STATUS_LABEL[c.status]}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-ink-faint">
                        {c.snapshotAt ? `Snapshotted ${c.snapshotAt}` : `${c.periodStart} → ${c.periodEnd}`}
                      </span>
                      <span className="tnum shrink-0 font-bold text-ink">{formatMoney(c.estimatedAmount)}</span>
                    </div>
                  </button>
                ))}
              </div>
              {/* Desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line/10 text-[11px] uppercase tracking-wider text-ink-faint">
                      <th className="px-4 py-3">Cycle</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((c) => (
                      <tr key={c.id} onClick={() => setReceiptId(c.id)}
                        className="cursor-pointer border-b border-line/10 transition last:border-0 hover:bg-ink/[0.03]">
                        <td className="px-4 py-3 font-medium text-ink">{c.campaignName} #{c.cycleNumber}</td>
                        <td className="px-4 py-3">
                          <Badge tone={c.status === "paid" ? "success" : "warning"}>{STATUS_LABEL[c.status]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-ink-soft">
                          {c.snapshotAt ? `Snapshotted ${c.snapshotAt}` : `${c.periodStart} → ${c.periodEnd}`}
                        </td>
                        <td className="tnum px-4 py-3 text-right font-semibold text-ink">{formatMoney(c.estimatedAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      {showAdd && (
        <Dialog title="Add payment method" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field label="Method">
              <select className={inputCls} value={mType} onChange={(e) => setMType(e.target.value as PayoutMethod)}>
                {METHOD_OPTIONS.map((o) => (
                  <option key={o} value={o}>{PAYOUT_METHOD_LABELS[o]}</option>
                ))}
              </select>
            </Field>
            <Field label={mType === "paypal" ? "PayPal email" : "Wallet address (Ethereum)"}>
              <input
                className={inputCls}
                value={mId}
                onChange={(e) => setMId(e.target.value)}
                placeholder={mType === "paypal" ? "you@example.com" : "0x…"}
              />
            </Field>
            {error && <p className="rounded-md bg-status-error/10 px-3 py-2 text-sm text-status-error">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" disabled={saving || !mId.trim()} onClick={handleAdd}>
                {saving ? "Saving…" : "Add method"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {receipt && (
        <Dialog title="Payout receipt" subtitle={`${receipt.campaignName} · #${receipt.cycleNumber}`} onClose={() => setReceiptId(null)}>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-faint">Status</dt>
              <dd><Badge tone={receipt.status === "paid" ? "success" : "warning"}>{STATUS_LABEL[receipt.status]}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-faint">Pay period</dt>
              <dd className="text-ink-soft">{receipt.periodStart} → {receipt.periodEnd}</dd>
            </div>
            <div className="flex justify-between border-t border-line/10 pt-4">
              <dt className="font-bold text-ink">Estimated amount</dt>
              <dd className="tnum font-bold text-ink">{formatMoney(receipt.estimatedAmount)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => window.print()}>Print / Save as PDF</Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
