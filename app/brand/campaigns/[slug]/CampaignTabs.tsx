"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge, Card, EmptyState, PlatformDot } from "@/components/ui";
import { PLATFORM_LABELS, type Bounty, type BrandCampaign, type CampaignClipperRow, type Clip, type TrackingStatus } from "@/lib/types";
import { formatCompact, formatMoney } from "@/lib/format";
import BountyManager from "./BountyManager";
import CampaignSettingsForm from "./CampaignSettingsForm";

const TRACKING_TONES: Record<TrackingStatus, "green" | "default" | "red" | "amber"> = {
  tracking: "green",
  not_tracking: "default",
  flagged: "red",
  pending_review: "amber",
};

const TRACKING_LABELS: Record<TrackingStatus, string> = {
  tracking: "Tracking",
  not_tracking: "Not tracking",
  flagged: "Flagged",
  pending_review: "Pending review",
};

const TABS = ["Clips", "Clippers", "Bounties", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function CampaignTabs({
  campaign,
  clips,
  clippers,
  bounties,
}: {
  campaign: BrandCampaign;
  clips: Clip[];
  clippers: CampaignClipperRow[];
  bounties: Bounty[];
}) {
  const [tab, setTab] = useState<Tab>("Clips");

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition ${
              tab === t
                ? "border-b-2 border-accent text-white"
                : "border-b-2 border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Clips" && <ClipsTab clips={clips} />}
      {tab === "Clippers" && <ClippersTab clippers={clippers} />}
      {tab === "Bounties" && <BountyManager campaignId={campaign.id} initial={bounties} />}
      {tab === "Settings" && <CampaignSettingsForm campaign={campaign} />}
    </div>
  );
}

function ClipsTab({ clips }: { clips: Clip[] }) {
  if (clips.length === 0) {
    return (
      <EmptyState
        title="No clips yet"
        body="Clips submitted to this campaign will show up here with verified views, engagement, and tracking status."
      />
    );
  }
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-right">Likes</th>
              <th className="px-4 py-3 text-right">Engagement</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Post</th>
            </tr>
          </thead>
          <tbody>
            {clips.map((c) => (
              <tr
                key={c.id}
                className={`border-b border-white/5 last:border-0 hover:bg-white/[0.03] ${
                  c.trackingStatus === "flagged"
                    ? "bg-red-500/[0.07]"
                    : c.trackingStatus === "pending_review"
                      ? "bg-amber-500/[0.07]"
                      : ""
                }`}
              >
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 text-white/80">
                    <PlatformDot platform={c.platform} />
                    {PLATFORM_LABELS[c.platform]}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/80">@{c.accountHandle}</td>
                <td className="px-4 py-3 text-right font-semibold text-white">
                  {formatCompact(c.views)}
                </td>
                <td className="px-4 py-3 text-right text-white/70">{formatCompact(c.likes)}</td>
                <td className="px-4 py-3 text-right text-white/70">{c.engagementPct}%</td>
                <td className="px-4 py-3">
                  <Badge tone={TRACKING_TONES[c.trackingStatus]}>
                    {TRACKING_LABELS[c.trackingStatus]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={c.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
                  >
                    View <ExternalLink size={13} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ClippersTab({ clippers }: { clippers: CampaignClipperRow[] }) {
  if (clippers.length === 0) {
    return (
      <EmptyState
        title="No clippers yet"
        body="Clippers participating in this campaign will appear here with their clip counts, views, and earnings."
      />
    );
  }
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Clipper</th>
              <th className="px-4 py-3 text-right">Clips</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-right">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {clippers.map((c) => (
              <tr key={c.userId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-white">{c.displayName}</td>
                <td className="px-4 py-3 text-right text-white/70">{c.clips}</td>
                <td className="px-4 py-3 text-right font-semibold text-white">
                  {formatCompact(c.views)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                  {formatMoney(c.earnings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
