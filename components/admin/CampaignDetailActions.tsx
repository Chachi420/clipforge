"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button, Dialog, Field } from "@/components/ui";
import { approveCampaign, rejectCampaign } from "@/lib/admin-actions";

/** Approve / reject controls on the admin campaign detail view.
 *  Only pending briefs need a decision; every other status renders nothing. */
export default function CampaignDetailActions({
  campaignId,
  campaignName,
  status,
}: {
  campaignId: string;
  campaignName: string;
  status: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  if (status !== "pending") return null;

  async function handleApprove() {
    setBusy(true);
    setError(null);
    try {
      await approveCampaign(campaignId);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Approval failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    setError(null);
    try {
      await rejectCampaign(campaignId, reason);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Rejection failed.");
    } finally {
      setBusy(false);
      setRejecting(false);
      setReason("");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-status-error/10 px-4 py-2.5 text-sm text-status-error">{error}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-soft">This brief is awaiting approval:</span>
        <Button onClick={() => setRejecting(true)} disabled={busy} variant="outline" className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10">
          <X size={14} /> Reject
        </Button>
        <Button onClick={handleApprove} disabled={busy} className="!px-3 !py-1.5 text-xs">
          <Check size={14} /> {busy ? "…" : "Approve"}
        </Button>
      </div>
      {rejecting && (
        <Dialog
          title={`Reject “${campaignName}”?`}
          subtitle="The brand will see your reason and can revise and resubmit."
          onClose={() => { setRejecting(false); setReason(""); }}
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
            <Button variant="outline" onClick={() => { setRejecting(false); setReason(""); }}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={busy} className="!bg-status-error hover:!bg-status-error/90">
              {busy ? "Rejecting…" : "Reject brief"}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
