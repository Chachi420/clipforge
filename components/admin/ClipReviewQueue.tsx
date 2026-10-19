"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Flag, FlagOff, Search } from "lucide-react";
import { Badge, Button, Card, Dialog, EmptyState, Field, PlatformDot } from "@/components/ui";
import { reviewClip, reviewClipsBulk, type AdminClip } from "@/lib/admin-actions";
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

type ConfirmState =
  | { kind: "reject"; id: string }
  | { kind: "flag"; id: string }
  | { kind: "bulk-reject" }
  | null;

export default function ClipReviewQueue({ initial }: { initial: AdminClip[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<ConfirmState>(null);
  const [note, setNote] = useState("");
  const router = useRouter();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter((c) =>
      [c.clipperName, c.clipperEmail, c.campaignName, c.handle, c.platform]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [initial, query]);

  const pendingRows = useMemo(() => rows.filter((c) => c.status === "pending_review"), [rows]);
  const allPendingSelected =
    pendingRows.length > 0 && pendingRows.every((c) => selected.has(c.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPending() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPendingSelected) {
        for (const c of pendingRows) next.delete(c.id);
      } else {
        for (const c of pendingRows) next.add(c.id);
      }
      return next;
    });
  }

  async function runSingle(id: string, action: "approve" | "reject" | "flag" | "unflag", n?: string) {
    setBusy(id);
    setError(null);
    try {
      await reviewClip(id, action, n);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setBusy(null);
      setConfirming(null);
      setNote("");
    }
  }

  async function runBulk(action: "approve" | "reject", n?: string) {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      const { handled, skipped } = await reviewClipsBulk(ids, action, n);
      setSelected(new Set());
      if (skipped > 0) {
        setError(
          `${handled} clip${handled === 1 ? "" : "s"} ${action === "approve" ? "approved" : "rejected"}. ${skipped} already handled, skipped.`
        );
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Bulk action failed.");
    } finally {
      setBulkBusy(false);
      setConfirming(null);
      setNote("");
    }
  }

  function confirmDialog() {
    if (!confirming) return null;
    const isBulk = confirming.kind === "bulk-reject";
    const count = isBulk ? selected.size : 1;
    const title =
      confirming.kind === "reject"
        ? "Reject clip"
        : confirming.kind === "flag"
          ? "Flag clip"
          : `Reject ${count} clip${count === 1 ? "" : "s"}`;
    const hint =
      confirming.kind === "flag"
        ? "Flagging pauses earnings until you review it."
        : "The clipper will see your reason.";
    const onConfirm = () => {
      const n = note.trim() || undefined;
      if (confirming.kind === "reject") runSingle(confirming.id, "reject", n);
      else if (confirming.kind === "flag") runSingle(confirming.id, "flag", n);
      else runBulk("reject", n);
    };
    return (
      <Dialog title={title} subtitle={hint} onClose={() => { setConfirming(null); setNote(""); }}>
        <Field label="Reason (shown to the clipper)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Optional — helps the clipper fix it next time"
            className="w-full rounded-lg border border-line/20 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setConfirming(null); setNote(""); }}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy !== null || bulkBusy}
            className="!bg-status-error hover:!bg-status-error/90"
          >
            {confirming.kind === "flag" ? "Flag clip" : `Reject${isBulk ? ` ${count}` : ""}`}
          </Button>
        </div>
      </Dialog>
    );
  }

  if (initial.length === 0) {
    return <EmptyState title="No clips here" body="Clips matching this filter will show up here." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-status-error/10 px-4 py-2.5 text-sm text-status-error">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clipper, campaign, handle…"
            className="w-full rounded-full border border-line/20 bg-paper py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
          />
        </div>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-line/20 bg-paper px-3 py-1.5">
            <span className="text-sm font-medium text-ink">{selected.size} selected</span>
            <Button
              onClick={() => runBulk("approve")}
              disabled={bulkBusy}
              className="!px-3 !py-1.5 text-xs"
            >
              <Check size={14} /> {bulkBusy ? "…" : "Approve all"}
            </Button>
            <Button
              onClick={() => setConfirming({ kind: "bulk-reject" })}
              disabled={bulkBusy}
              variant="outline"
              className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
            >
              <X size={14} /> Reject all
            </Button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-medium text-ink-faint hover:text-ink"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No matches" body="Try a different search." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
                  {pendingRows.length > 0 && (
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allPendingSelected}
                        onChange={toggleAllPending}
                        aria-label="Select all awaiting review"
                        className="h-4 w-4 accent-black"
                      />
                    </th>
                  )}
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
                {rows.map((c) => (
                  <tr key={c.id} className="transition hover:bg-ink/[0.03]">
                    {pendingRows.length > 0 && (
                      <td className="px-4 py-3">
                        {c.status === "pending_review" && (
                          <input
                            type="checkbox"
                            checked={selected.has(c.id)}
                            onChange={() => toggle(c.id)}
                            aria-label={`Select clip by ${c.clipperName}`}
                            className="h-4 w-4 accent-black"
                          />
                        )}
                      </td>
                    )}
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
                              onClick={() => setConfirming({ kind: "reject", id: c.id })}
                              disabled={busy === c.id || bulkBusy}
                              variant="outline"
                              className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                            >
                              <X size={14} /> Reject
                            </Button>
                            <Button
                              onClick={() => runSingle(c.id, "approve")}
                              disabled={busy === c.id || bulkBusy}
                              className="!px-3 !py-1.5 text-xs"
                            >
                              <Check size={14} /> {busy === c.id ? "…" : "Approve"}
                            </Button>
                          </>
                        )}
                        {c.status === "tracking" && (
                          <Button
                            onClick={() => setConfirming({ kind: "flag", id: c.id })}
                            disabled={busy === c.id || bulkBusy}
                            variant="outline"
                            className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                          >
                            <Flag size={14} /> Flag
                          </Button>
                        )}
                        {c.status === "flagged" && (
                          <Button
                            onClick={() => runSingle(c.id, "unflag")}
                            disabled={busy === c.id || bulkBusy}
                            className="!px-3 !py-1.5 text-xs"
                          >
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
      )}
      <p className="text-xs text-ink-faint">
        Approving starts view tracking and earnings. Rejecting stops the clip permanently. Flagging pauses a live clip until you review it.
      </p>
      {confirmDialog()}
    </div>
  );
}
