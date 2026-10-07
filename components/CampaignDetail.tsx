"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Upload } from "lucide-react";
import Header from "@/components/Header";
import UploadClipDialog from "@/components/UploadClipDialog";
import { ClipTable } from "@/components/ClipTable";
import { Badge, Button, Card, ProgressBar, Stat, inputCls } from "@/components/ui";
import { joinCampaign } from "@/lib/actions";
import { PAYOUT_METHOD_LABELS, type Bounty, type Campaign, type Clip, type PayoutCycle } from "@/lib/types";
import { formatCompact, formatMoney } from "@/lib/format";

export default function CampaignDetail({
  campaign, bounties, clips, cycles,
}: {
  campaign: Campaign; bounties: Bounty[]; clips: Clip[]; cycles: PayoutCycle[];
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [bountyQuery, setBountyQuery] = useState("");
  const [cycleTab, setCycleTab] = useState<"pending" | "paid">("pending");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(!!campaign.isJoined);

  async function handleJoin() {
    setJoining(true);
    try {
      await joinCampaign(campaign.id);
      setJoined(true);
    } catch (e: any) {
      alert(e.message ?? "Could not join campaign.");
    } finally {
      setJoining(false);
    }
  }

  const shownBounties = bounties.filter((b) =>
    b.name.toLowerCase().includes(bountyQuery.toLowerCase())
  );
  const liveCycle = cycles.find((c) => c.status === "live");
  const pendingCycles = cycles.filter((c) => c.status !== "live" && c.status !== "paid");
  const paidCycles = cycles.filter((c) => c.status === "paid");

  return (
    <>
      <Header title={campaign.name} subtitle="Campaign details" />
      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/campaigns" className="flex items-center gap-1.5 text-sm text-white/55 hover:text-white">
            <ArrowLeft size={16} /> Campaigns
          </Link>
          <Badge tone={campaign.status === "active" ? "green" : "amber"}>{campaign.status}</Badge>
          <Badge>{PAYOUT_METHOD_LABELS[campaign.payoutMethod]}</Badge>
          <Badge tone="blue">{campaign.daysLeft} days left</Badge>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => {}}>
            <Share2 size={15} /> Share
          </Button>
          {!joined && campaign.status === "active" && (
            <Button variant="outline" onClick={handleJoin} disabled={joining}>
              {joining ? "Joining…" : "Join campaign"}
            </Button>
          )}
          <Button onClick={() => setShowUpload(true)} disabled={!joined}>
            <Upload size={15} /> Upload clip
          </Button>
        </div>
        {!joined && campaign.status === "active" && (
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm text-white/70">
            Join this campaign to start submitting clips and earning.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-bold">Campaign info</h3>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Rate per 100K" value={`$${campaign.ratePer100k}–$${Math.max(campaign.ratePer100k, 300)}`} />
              <Stat label="Active bounties" value={`${bounties.filter((b) => b.isActive).length}`} />
              <Stat label="Start date" value={campaign.startDate} />
              <Stat label="Min views" value={formatCompact(campaign.minViewsTotal)} sub={`${formatCompact(campaign.minViewsPerPost)} per post`} />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="mb-4 font-bold">Campaign details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Program structure</dt>
                <dd className="text-right text-white/80">{campaign.payoutMode === "pot" ? "Pot-style proportional payout" : "Flat rate per verified view"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Payment method</dt>
                <dd className="text-white/80">{PAYOUT_METHOD_LABELS[campaign.payoutMethod]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Account limit</dt>
                <dd className="text-white/80">{campaign.accountLimit ? `${campaign.accountLimit} accounts` : "Unlimited"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Duration</dt>
                <dd className="text-white/80 capitalize">{campaign.durationMode === "budget" ? "Until budget spent" : "Fixed deadline"}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">{campaign.rules}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Campaign bounties</h3>
              <p className="text-sm text-white/45">Special incentive rates with qualification requirements.</p>
            </div>
            <input value={bountyQuery} onChange={(e) => setBountyQuery(e.target.value)}
              placeholder="Search bounties…" className={`${inputCls} max-w-xs`} />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {shownBounties.map((b) => (
              <div key={b.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{b.name}</span>
                  <Badge tone={b.isActive ? "green" : "default"}>{b.isActive ? "Active" : "Ended"}</Badge>
                </div>
                <div className="mt-1 text-sm font-semibold text-emerald-400">${b.ratePer100k}/100K</div>
                {b.requirements && <div className="mt-2 text-xs text-white/45">Requires: {b.requirements}</div>}
                <div className="mt-3 text-xs text-white/45">
                  {formatCompact(b.clipCount)} clips · {formatCompact(b.totalViews)} views
                </div>
                {b.budgetCap && (
                  <div className="mt-2">
                    <ProgressBar pct={b.budgetUsedPct} />
                    <div className="mt-1 text-[11px] text-white/35">{b.budgetUsedPct}% of budget used</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {shownBounties.length === 0 && <p className="py-8 text-center text-sm text-white/45">No bounties match.</p>}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Your payouts</h3>
              <p className="text-sm text-white/45">Track earnings, pending cycles, and history for this campaign.</p>
            </div>
            <div className="flex gap-2">
              {(["pending", "paid"] as const).map((t) => (
                <button key={t} onClick={() => setCycleTab(t)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${cycleTab === t ? "bg-accent text-white" : "bg-white/5 text-white/60"}`}>
                  {t} {t === "pending" ? pendingCycles.length : paidCycles.length}
                </button>
              ))}
            </div>
          </div>

          {liveCycle && (
            <div className="mb-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-accent-soft">Current cycle (live)</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-2xl font-black">{formatMoney(liveCycle.estimatedAmount)}</span>
                <span className="text-xs text-white/45">estimated — updates as your clips accrue views</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(cycleTab === "pending" ? pendingCycles : paidCycles).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4">
                <div>
                  <div className="font-semibold">{campaign.name} #{c.cycleNumber}</div>
                  <div className="text-xs text-white/45">
                    {c.periodStart} → {c.periodEnd}
                    {c.snapshotAt ? ` · Snapshotted ${c.snapshotAt}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={c.status === "paid" ? "green" : "amber"}>
                    {c.status === "paid" ? "Paid" : "Awaiting admin review"}
                  </Badge>
                  <span className="font-bold text-emerald-400">{formatMoney(c.estimatedAmount)}</span>
                </div>
              </div>
            ))}
            {(cycleTab === "pending" ? pendingCycles : paidCycles).length === 0 && (
              <p className="py-6 text-center text-sm text-white/45">Nothing here yet.</p>
            )}
          </div>
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Your clips ({clips.length})</h3>
            <Button variant="outline" onClick={() => setShowUpload(true)}>Upload new clip</Button>
          </div>
          <ClipTable clips={clips} />
        </div>
      </div>

      {showUpload && <UploadClipDialog campaignId={campaign.id} campaignName={campaign.name} onClose={() => setShowUpload(false)} />}
    </>
  );
}
