"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Dialog, PlatformDot } from "./ui";
import { PLATFORM_LABELS, type Clip } from "@/lib/types";
import { formatCompact, formatMoney } from "@/lib/format";
import { deleteClip } from "@/lib/actions";

export function ClipTable({ clips }: { clips: Clip[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = clips.find((c) => c.id === openId);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Likes</th>
              <th className="px-4 py-3">Payout</th>
            </tr>
          </thead>
          <tbody>
            {clips.map((c) => (
              <tr key={c.id} onClick={() => setOpenId(c.id)}
                className="cursor-pointer border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Badge tone={c.trackingStatus === "tracking" ? "green" : "amber"}>
                    {c.trackingStatus === "tracking" ? "Tracking" : "Not tracking"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 text-white/70">
                    <PlatformDot platform={c.platform} /> {PLATFORM_LABELS[c.platform]}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70">{c.accountHandle}</td>
                <td className="px-4 py-3 font-semibold text-white">{formatCompact(c.views)}</td>
                <td className="px-4 py-3 text-white/70">{formatCompact(c.likes)}</td>
                <td className="px-4 py-3 font-semibold text-emerald-400">{formatMoney(c.payout)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clips.length === 0 && (
        <p className="py-10 text-center text-sm text-white/45">No clips submitted yet. Upload your first clip to start tracking.</p>
      )}
      {open && <ClipDetailDialog clip={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function ClipDetailDialog({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "analytics">("overview");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this clip? Tracking will stop.")) return;
    setDeleting(true);
    try {
      await deleteClip(clip.id);
      onClose();
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "Could not delete clip.");
      setDeleting(false);
    }
  }
  return (
    <Dialog title="Clip details" subtitle={`${PLATFORM_LABELS[clip.platform]} post · ${clip.accountHandle}`} onClose={onClose} wide>
      <div className="mb-4 flex gap-2">
        {(["overview", "analytics"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-accent text-white" : "bg-white/5 text-white/60"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Views", formatCompact(clip.views)], ["Likes", formatCompact(clip.likes)],
            ["Comments", formatCompact(clip.comments)], ["Engagement", `${clip.engagementPct}%`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-white/10 p-4">
              <div className="text-[11px] uppercase tracking-wider text-white/40">{l}</div>
              <div className="mt-1 text-xl font-bold">{v}</div>
            </div>
          ))}
          <div className="col-span-2 rounded-xl border border-white/10 p-4 md:col-span-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Tracking status</span>
              <Badge tone={clip.trackingStatus === "tracking" ? "green" : "amber"}>
                {clip.trackingStatus === "tracking" ? "Tracking" : "Not tracking"}
              </Badge>
            </div>
            <div className="mt-3 flex justify-end">
              <Button variant="outline" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete clip"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 p-6 text-center">
          <p className="text-sm text-white/55">Views · Likes · Comments over 7D / 30D / 90D / All</p>
          <div className="mx-auto mt-4 flex h-40 max-w-md items-end justify-center gap-1.5">
            {[35, 55, 40, 70, 62, 88, 75, 95, 68, 82, 58, 76].map((h, i) => (
              <div key={i} className="w-8 rounded-t bg-accent/50" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="mt-4 text-xs text-white/35">Chart stats are scanned daily. Sudden drops may occur due to bot protection cleanups.</p>
        </div>
      )}
    </Dialog>
  );
}
