"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Flag, FlagOff } from "lucide-react";
import { Badge, Button, Card, EmptyState, PlatformDot } from "@/components/ui";
import { reviewClip, type AdminClip } from "@/lib/admin-actions";
import { PLATFORM_LABELS } from "@/lib/types";
import { formatCompact } from "@/lib/format";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "blue" | undefined> = {
  tracking: "green",
  pending_review: "amber",
  flagged: "red",
  not_tracking: undefined,
};

const STATUS_LABEL: Record<string, string> = {
  tracking: "Tracking",
  pending_review: "Awaiting review",
  flagged: "Flagged",
  not_tracking: "Rejected",
};

export default function ClipReviewQueue({ initial }: { initial: AdminClip[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function act(id: string, action: "approve" | "reject" | "flag" | "unflag", clipName: string) {
    let note: string | null = null;
    if (action === "reject") {
      note = window.prompt(`Reject this clip? The clipper will see your reason.`);
      if (note === null) return;
    }
    if (action === "flag") {
      note = window.prompt(`Flag this clip? It pauses earnings until reviewed.`);
      if (note === null) return;
    }
    setBusy(id);
    setError(null);
    try {
      await reviewClip(id, action, note ?? undefined);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="No clips here" body="Clips matching this filter will show up here." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-status-error/10 px-4 py-2.5 text-sm text-status-error">{error}</p>
      )}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
                <th className="px-4 py-3">Clip</th>
                <th className="px-4 py-3">Clipper</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {initial.map((c) => (
                <tr key={c.id} className="transition hover:bg-ink/[0.03]">
                  <td className="px-4 py-3">
                    <a href={c.postUrl} target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-line hover:decoration-ink">
                      View clip ↗
                    </a>
                    <div className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                      <PlatformDot platform={c.platform} />
                      {PLATFORM_LABELS[c.platform as keyof typeof PLATFORM_LABELS] ?? c.platform}
                      {c.handle ? ` · ${c.handle}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{c.clipperName}</div>
                    <div className="text-xs text-ink-faint">{c.clipperEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.campaignName}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{formatCompact(c.views)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.submittedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {c.status === "pending_review" && (
                        <>
                          <Button
                            onClick={() => act(c.id, "reject", c.campaignName)}
                            disabled={busy === c.id}
                            variant="outline"
                            className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                          >
                            <X size={14} /> {busy === c.id ? "…" : "Reject"}
                          </Button>
                          <Button onClick={() => act(c.id, "approve", c.campaignName)} disabled={busy === c.id} className="!px-3 !py-1.5 text-xs">
                            <Check size={14} /> {busy === c.id ? "…" : "Approve"}
                          </Button>
                        </>
                      )}
                      {c.status === "tracking" && (
                        <Button
                          onClick={() => act(c.id, "flag", c.campaignName)}
                          disabled={busy === c.id}
                          variant="outline"
                          className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                        >
                          <Flag size={14} /> {busy === c.id ? "…" : "Flag"}
                        </Button>
                      )}
                      {c.status === "flagged" && (
                        <Button onClick={() => act(c.id, "unflag", c.campaignName)} disabled={busy === c.id} className="!px-3 !py-1.5 text-xs">
                          <FlagOff size={14} /> {busy === c.id ? "…" : "Unflag"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-ink-faint">
        Approving starts view tracking and earnings. Rejecting stops the clip permanently. Flagging pauses a live clip until you review it.
      </p>
    </div>
  );
}
