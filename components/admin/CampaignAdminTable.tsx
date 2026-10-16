"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import { Badge, Button, Card, Dialog, EmptyState, Field, PlatformDot } from "@/components/ui";
import { approveCampaign, rejectCampaign, updateCampaignRate, type AdminCampaign } from "@/lib/admin-actions";
import { PLATFORM_LABELS } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "blue" | undefined> = {
  active: "green",
  pending: "amber",
  paused: "blue",
  private: undefined,
};

const TYPE_LABELS: Record<string, string> = {
  per_view: "Pay per view",
  bounty: "Bounty",
  pot: "Prize pot",
};

export default function CampaignAdminTable({ initial }: { initial: AdminCampaign[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [rateValue, setRateValue] = useState("");
  const [rejecting, setRejecting] = useState<{ id: string; name: string } | null>(null);
  const [reason, setReason] = useState("");
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

  async function handleReject(id: string, r: string) {
    setBusy(id);
    setError(null);
    try {
      await rejectCampaign(id, r);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Rejection failed.");
    } finally {
      setBusy(null);
      setRejecting(null);
      setReason("");
    }
  }

  async function handleRate(id: string) {
    const rate = Number(rateValue);
    if (!(rate >= 0)) {
      setError("Rate must be zero or positive.");
      return;
    }
    setBusy(id);
    setError(null);
    try {
      await updateCampaignRate(id, rate);
      setEditingRate(null);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Rate update failed.");
    } finally {
      setBusy(null);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="No campaigns here" body="Campaigns matching this filter will show up here." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-status-error/10 px-4 py-2.5 text-sm text-status-error">{error}</p>
      )}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Rate / 100k</th>
                <th className="px-4 py-3 text-right">Budget cap</th>
                <th className="px-4 py-3 text-right">Clips</th>
                <th className="px-4 py-3">Platforms</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {initial.map((c) => (
                <tr key={c.id} className="transition hover:bg-ink/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{c.name}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge tone="blue">{c.category}</Badge>
                      <Badge>{TYPE_LABELS[c.type] ?? c.type}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.brandName}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingRate === c.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={rateValue}
                          onChange={(e) => setRateValue(e.target.value)}
                          className="w-20 rounded-md border border-line/10 bg-paper px-2 py-1 text-sm text-ink"
                        />
                        <Button onClick={() => handleRate(c.id)} disabled={busy === c.id} className="!px-2 !py-1 text-xs">
                          Save
                        </Button>
                        <Button onClick={() => setEditingRate(null)} variant="outline" className="!px-2 !py-1 text-xs">
                          Cancel
                        </Button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                        {formatMoney(c.ratePer100k)}
                        <button
                          aria-label="Edit rate"
                          onClick={() => {
                            setEditingRate(c.id);
                            setRateValue(String(c.ratePer100k));
                          }}
                          className="text-ink-faint hover:text-ink"
                        >
                          <Pencil size={13} />
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-soft">
                    {c.budgetCap != null ? formatMoney(c.budgetCap) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{c.clipCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {(c.platforms ?? []).map((p) => (
                        <span key={p} className="flex items-center gap-1 text-xs text-ink-soft">
                          <PlatformDot platform={p} />
                          {PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS] ?? p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "pending" && (
                      <div className="inline-flex items-center gap-2">
                        <Button
                          onClick={() => setRejecting({ id: c.id, name: c.name })}
                          disabled={busy === c.id}
                          variant="outline"
                          className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                        >
                          <X size={14} /> {busy === c.id ? "…" : "Reject"}
                        </Button>
                        <Button onClick={() => handleApprove(c.id)} disabled={busy === c.id} className="!px-3 !py-1.5 text-xs">
                          <Check size={14} /> {busy === c.id ? "…" : "Approve"}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-ink-faint">
        Approving sets a pending brief live. The pencil edits the pay rate on live, paused, or pending campaigns.
      </p>
      {rejecting && (
        <Dialog
          title={`Reject “${rejecting.name}”?`}
          subtitle="The brand will see your reason and can revise and resubmit."
          onClose={() => { setRejecting(null); setReason(""); }}
        >
          <Field label="Reason (shown to the brand)">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Optional"
              className="w-full rounded-lg border border-line/20 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
            />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setRejecting(null); setReason(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => handleReject(rejecting.id, reason)}
              disabled={busy === rejecting.id}
              className="!bg-status-error hover:!bg-status-error/90"
            >
              {busy === rejecting.id ? "Rejecting…" : "Reject brief"}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
