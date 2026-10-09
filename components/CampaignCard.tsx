import Link from "next/link";
import { Badge, Card, PlatformDot } from "./ui";
import { PAYOUT_METHOD_LABELS, PLATFORM_LABELS, type Campaign } from "@/lib/types";
import { formatCompact } from "@/lib/format";

function toneFor(status: Campaign["status"]) {
  return status === "active" ? "green" : status === "paused" ? "amber" : "blue";
}

function rateLine(c: Campaign): string {
  if (c.type === "pot" && c.potValue) return `Pot value ${formatCompact(c.potValue)}`;
  if (c.type === "bounty" && c.bountyPot) return `Bounty pot $${c.bountyPot}`;
  return `Up to $${c.ratePer100k} per 100k`;
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className="flex flex-col p-5 transition hover:border-electric-deep/30">
      <div className="mb-3 flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-electric/20 text-lg font-black text-electric-deep">
          {campaign.name.slice(0, 1)}
        </span>
        <Badge tone={toneFor(campaign.status)}>{campaign.status}</Badge>
      </div>
      <Link href={`/dashboard/campaigns/${campaign.slug}`} className="text-base font-bold text-ink hover:underline">
        {campaign.name}
      </Link>
      <div className="mt-1 text-xs text-ink-faint">
        {campaign.daysLeft} days left · Min {formatCompact(campaign.minViewsTotal)} views to qualify
      </div>
      <div className="mt-3 text-sm font-semibold text-electric-deep">{rateLine(campaign)}</div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="mr-1 text-[11px] uppercase tracking-wider text-ink-faint">Platforms</span>
        {campaign.platforms.map((p) => (
          <PlatformDot key={p} platform={p} />
        ))}
        <span className="ml-1 text-[11px] text-ink-faint">
          {campaign.platforms.map((p) => PLATFORM_LABELS[p]).join(" · ")}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-ink-faint">{PAYOUT_METHOD_LABELS[campaign.payoutMethod]}</div>
      <div className="mt-4 flex-1" />
      {campaign.status === "private" ? (
        <button className="mt-2 w-full rounded-full border border-line/15 py-2 text-sm font-semibold text-ink-soft hover:bg-ink/5">
          Apply for access
        </button>
      ) : (
        <Link
          href={`/dashboard/campaigns/${campaign.slug}`}
          className="mt-2 block w-full rounded-full bg-ink/5 py-2 text-center text-sm font-semibold text-ink hover:bg-ink/10"
        >
          {campaign.isJoined ? "Open campaign" : "View campaign"}
        </Link>
      )}
    </Card>
  );
}
