"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Link2, Upload } from "lucide-react";
import Header from "@/components/Header";
import UploadClipDialog from "@/components/UploadClipDialog";
import { ClipTable } from "@/components/ClipTable";
import { Badge, Button, Card, NightCard, ProgressBar, Stat, inputCls } from "@/components/ui";
import { joinCampaign } from "@/lib/actions";
import { CAMPAIGN_STATUS_LABELS, PAYOUT_METHOD_LABELS, type Bounty, type Campaign, type Clip, type PayoutCycle } from "@/lib/types";
import { formatCompact, formatMoney } from "@/lib/format";

function statusTone(status: Campaign["status"]) {
  if (status === "active") return "success";
  if (status === "paused" || status === "pending") return "warning";
  return "default";
}

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
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleJoin() {
    setJoining(true);
    setJoinError(null);
    try {
      await joinCampaign(campaign.id);
      setJoined(true);
    } catch (e: any) {
      setJoinError(e.message ?? "Could not join campaign.");
    } finally {
      setJoining(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const shownBounties = bounties.filter((b) =>
    b.name.toLowerCase().includes(bountyQuery.toLowerCase())
  );
  const liveCycle = cycles.find((c) => c.status === "live");
  const pendingCycles = cycles.filter((c) => c.status !== "live" && c.status !== "paid");
  const paidCycles = cycles.filter((c) => c.status === "paid");

  return (
    <>
      <Header
        title={campaign.name}
        subtitle="Campaign details"
        action={
          <Button variant="primary" onClick={() => setShowUpload(true)} disabled={!joined}>
            <Upload size={15} /> Upload clips
          </Button>
        }
      />
      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        {/* Top row: back link, badges, secondary actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/campaigns" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={16} /> Campaigns
          </Link>
          <Badge tone={statusTone(campaign.status)}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
          <Badge>{PAYOUT_METHOD_LABELS[campaign.payoutMethod]}</Badge>
          <Badge>{campaign.daysLeft} days left</Badge>
          <div className="flex-1" />
          <Button variant="outline" onClick={copyLink}>
            {copied ? <Check size={15} /> : <Link2 size={15} />} {copied ? "Copied" : "Copy link"}
          </Button>
          {!joined && campaign.status === "active" && (
            <Button variant="outline" onClick={handleJoin} disabled={joining}>
              {joining ? "Joining…" : "Join campaign"}
            </Button>
          )}
        </div>
        {joinError && (
          <p role="alert" className="rounded-card border border-status-error/25 bg-status-error/10 px-4 py-3 text-sm text-status-error">
            {joinError}
          </p>
        )}
        {!joined && campaign.status === "active" && (
          <div className="rounded-card border border-line/10 bg-surface p-4 text-sm text-ink-soft">
            Join this campaign to start submitting clips and earning.
          </div>
        )}

        {/* LIVE cycle — the money view first */}
        {liveCycle && (
          <NightCard className="p-6">
            <div className="micro-label text-white/50">Current cycle · Live</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="tnum display text-4xl font-bold tracking-tight text-white">
                {formatMoney(liveCycle.estimatedAmount)}
              </span>
              <span className="text-sm text-white/60">Estimated — updates as views accrue</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Verified views</div>
                <div className="tnum mt-1 text-2xl font-bold text-white">{formatCompact(liveCycle.totalViews)}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Your clips</div>
                <div className="tnum mt-1 text-2xl font-bold text-white">{liveCycle.totalClips}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Cycle dates</div>
                <div className="tnum mt-1 text-sm font-semibold text-white">
                  {liveCycle.periodStart} → {liveCycle.periodEnd}
                </div>
              </div>
            </div>
          </NightCard>
        )}

        {/* Bounties */}
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-ink">Campaign bounties</h3>
              <p className="text-sm text-ink-faint">Special incentive rates with qualification requirements.</p>
            </div>
            <input value={bountyQuery} onChange={(e) => setBountyQuery(e.target.value)}
              placeholder="Search bounties…" aria-label="Search bounties" className={`${inputCls} max-w-xs`} />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {shownBounties.map((b) => (
              <div key={b.id} className="rounded-card border border-line/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-ink">{b.name}</span>
                  <Badge tone={b.isActive ? "success" : "default"}>{b.isActive ? "Active" : "Ended"}</Badge>
                </div>
                <div className="tnum mt-1 text-sm font-semibold text-ink">${b.ratePer100k}/100K</div>
                {b.requirements && <div className="mt-2 text-xs text-ink-faint">Requires: {b.requirements}</div>}
                <div className="tnum mt-3 text-xs text-ink-faint">
                  {formatCompact(b.clipCount)} clips · {formatCompact(b.totalViews)} views
                </div>
                {b.budgetCap && (
                  <div className="mt-2">
                    <ProgressBar pct={b.budgetUsedPct} />
                    <div className="tnum mt-1 text-[11px] text-ink-faint">{b.budgetUsedPct}% of budget used</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {shownBounties.length === 0 && <p className="py-8 text-center text-sm text-ink-faint">No bounties match.</p>}
        </Card>

        {/* Campaign info + details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-bold text-ink">Campaign info</h3>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Rate per 100K" value={`$${campaign.ratePer100k}`} sub="per 100K verified views" />
              <Stat label="Active bounties" value={`${bounties.filter((b) => b.isActive).length}`} />
              <Stat label="Start date" value={campaign.startDate} />
              <Stat label="Min views" value={formatCompact(campaign.minViewsTotal)} sub={`${formatCompact(campaign.minViewsPerPost)} per post`} />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="mb-4 font-bold text-ink">Campaign details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Program structure</dt>
                <dd className="text-right text-ink-soft">{campaign.payoutMode === "pot" ? "Pot-style proportional payout" : "Flat rate per verified view"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Payment method</dt>
                <dd className="text-ink-soft">{PAYOUT_METHOD_LABELS[campaign.payoutMethod]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Account limit</dt>
                <dd className="text-ink-soft">{campaign.accountLimit ? `${campaign.accountLimit} accounts` : "Unlimited"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Duration</dt>
                <dd className="text-ink-soft capitalize">{campaign.durationMode === "budget" ? "Until budget spent" : "Fixed deadline"}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-line/10 pt-4 text-xs leading-relaxed text-ink-faint">{campaign.rules}</p>
          </Card>
        </div>

        {/* Payouts with pending/paid toggles + per-cycle breakdown */}
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-ink">Your payouts</h3>
              <p className="text-sm text-ink-faint">Track earnings, pending cycles, and history for this campaign.</p>
            </div>
            <div className="flex gap-2" role="group" aria-label="Filter cycles by status">
              {(["pending", "paid"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setCycleTab(t)} aria-pressed={cycleTab === t}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-colors duration-micro ${cycleTab === t ? "bg-ink text-paper" : "bg-ink/5 text-ink-soft hover:bg-ink/10"}`}>
                  {t} <span className="tnum">{t === "pending" ? pendingCycles.length : paidCycles.length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {(cycleTab === "pending" ? pendingCycles : paidCycles).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line/10 p-4">
                <div>
                  <div className="font-semibold text-ink">{campaign.name} #{c.cycleNumber}</div>
                  <div className="tnum text-xs text-ink-faint">
                    {c.periodStart} → {c.periodEnd}
                    {c.snapshotAt ? ` · Snapshotted ${c.snapshotAt}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={c.status === "paid" ? "success" : "warning"}>
                    {c.status === "paid" ? "Paid" : "Awaiting admin review"}
                  </Badge>
                  <span className="tnum font-bold text-ink">{formatMoney(c.estimatedAmount)}</span>
                </div>
              </div>
            ))}
            {(cycleTab === "pending" ? pendingCycles : paidCycles).length === 0 && (
              <p className="py-6 text-center text-sm text-ink-faint">Nothing here yet.</p>
            )}
          </div>
        </Card>

        {/* Your clips */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="display text-lg">Your clips ({clips.length})</h3>
            <Button variant="outline" onClick={() => setShowUpload(true)} disabled={!joined}>Upload new clip</Button>
          </div>
          <ClipTable clips={clips} />
        </div>
      </div>

      {showUpload && <UploadClipDialog campaignId={campaign.id} campaignName={campaign.name} onClose={() => setShowUpload(false)} />}
    </>
  );
}
