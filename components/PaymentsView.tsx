"use client";
import { useState } from "react";
import { Download, Plus } from "lucide-react";
import Header from "@/components/Header";
import { Badge, Button, Card, Dialog, Stat } from "@/components/ui";
import { PAYOUT_METHOD_LABELS, type PaymentMethodRow, type PayoutCycle } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const STATUS_LABEL: Record<PayoutCycle["status"], string> = {
  live: "Live", pending_review: "Pending", awaiting_mark_paid: "Awaiting admin Mark Paid", paid: "Paid",
};

export default function PaymentsPage({
  cycles, methods,
}: {
  cycles: PayoutCycle[]; methods: PaymentMethodRow[];
}) {
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const receipt = cycles.find((c) => c.id === receiptId);

  const awaiting = cycles.filter((c) => c.status === "awaiting_mark_paid");
  const awaitingTotal = awaiting.reduce((s, c) => s + c.estimatedAmount, 0);
  const live = cycles.find((c) => c.status === "live");

  return (
    <>
      <Header title="Payments" subtitle="Manage your earnings and payment methods" />
      <div className="space-y-6 px-8 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <Stat label="Est. payout" value={live ? formatMoney(live.estimatedAmount) : "$0.00"} sub="Current cycle estimate" />
          </Card>
          <Card className="p-5">
            <Stat label="Active campaigns" value={`${awaiting.length}`} sub="With pending payouts" />
          </Card>
          <Card className="p-5">
            <Stat label="Payout history" value={`${cycles.filter((c) => c.status === "paid").length} paid`} sub="Lifetime payouts received" />
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Payment methods</h3>
            <Button variant="outline" onClick={() => alert("Demo mode: add-payment-method form would open here.")}>
              <Plus size={15} /> Add payment method
            </Button>
          </div>
          <div className="space-y-2">
            {methods.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4">
                <div>
                  <div className="font-semibold">{PAYOUT_METHOD_LABELS[m.type]}</div>
                  <div className="font-mono text-xs text-white/45">{m.masked}</div>
                </div>
                {m.isDefault && <Badge tone="blue">Default</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Payout history</h3>
            <Button variant="ghost" onClick={() => alert("Demo mode: XLSX export would download here.")}>
              <Download size={15} /> Export .xlsx
            </Button>
          </div>
          {awaitingTotal > 0 && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
              <span className="font-bold text-amber-300">{formatMoney(awaitingTotal)}</span>
              <span className="text-white/55"> awaiting payout — {awaiting.length} cycle{awaiting.length === 1 ? "" : "s"} awaiting Mark Paid</span>
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3">Cycle</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {cycles.filter((c) => c.status !== "live").map((c) => (
                  <tr key={c.id} onClick={() => setReceiptId(c.id)}
                    className="cursor-pointer border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-white">{c.campaignName} #{c.cycleNumber}</td>
                    <td className="px-4 py-3">
                      <Badge tone={c.status === "paid" ? "green" : "amber"}>{STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-white/55">
                      {c.snapshotAt ? `Snapshotted ${c.snapshotAt}` : `${c.periodStart} → ${c.periodEnd}`}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">{formatMoney(c.estimatedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {receipt && (
        <Dialog title="Payout receipt" subtitle={`${receipt.campaignName} · #${receipt.cycleNumber}`} onClose={() => setReceiptId(null)}>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/45">Status</dt>
              <dd><Badge tone={receipt.status === "paid" ? "green" : "amber"}>{STATUS_LABEL[receipt.status]}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/45">Pay period</dt>
              <dd className="text-white/80">{receipt.periodStart} → {receipt.periodEnd}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/45">Total views</dt>
              <dd className="text-white/80">{receipt.totalViews.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/45">Total clips</dt>
              <dd className="text-white/80">{receipt.totalClips}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4">
              <dt className="font-bold">Estimated amount</dt>
              <dd className="font-black text-emerald-400">{formatMoney(receipt.estimatedAmount)}</dd>
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
