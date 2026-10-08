"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Badge, Button, EmptyState, PlatformDot } from "@/components/ui";
import { approveCampaign, rejectCampaign, type PendingCampaign } from "@/lib/admin-actions";
import { PLATFORM_LABELS } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  per_view: "Pay per view",
  bounty: "Bounty",
  pot: "Prize pot",
};

export default function CampaignApprovalQueue({ initial }: { initial: PendingCampaign[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleApprove(id: string) {
    setBusy(id);
    setError(null);
    try {
      await approveCampaign(id);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Approval failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(id: string, name: string) {
    const reason = window.prompt(
      `Reject the campaign brief "${name}"? The brand will see your reason. Leave blank for the default message.`
    );
    if (reason === null) return; // cancelled
    setBusy(id);
    setError(null);
    try {
      await rejectCampaign(id, reason);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Rejection failed.");
    } finally {
      setBusy(null);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="No campaigns awaiting approval" body="New campaign briefs from brands will show up here for review." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3 text-right">Rate / 100k</th>
              <th className="px-4 py-3 text-right">Budget cap</th>
              <th className="px-4 py-3">Platforms</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{c.brandName}</div>
                  <div className="text-xs text-white/40">{c.brandEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge tone="blue">{c.category}</Badge>
                    <Badge>{TYPE_LABELS[c.type] ?? c.type}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-white">
                  {formatMoney(c.ratePer100k)}
                </td>
                <td className="px-4 py-3 text-right text-white/55">
                  {c.budgetCap != null ? formatMoney(c.budgetCap) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {(c.platforms ?? []).map((p) => (
                      <span key={p} className="flex items-center gap-1 text-xs text-white/55">
                        <PlatformDot platform={p} />
                        {PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS] ?? p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-white/55">{c.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      onClick={() => handleReject(c.id, c.name)}
                      disabled={busy === c.id}
                      variant="outline"
                      className="!px-3 !py-1.5 text-xs !text-red-300 !border-red-500/30 hover:!bg-red-500/10"
                    >
                      <X size={14} /> {busy === c.id ? "…" : "Reject"}
                    </Button>
                    <Button
                      onClick={() => handleApprove(c.id)}
                      disabled={busy === c.id}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      <Check size={14} /> {busy === c.id ? "…" : "Approve"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/35">
        Approving sets the campaign live for clippers. Rejecting deletes the brief and
        notifies the brand with your reason, so they can revise and resubmit.
      </p>
    </div>
  );
}
