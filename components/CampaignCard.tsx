"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Dialog, PlatformDot } from "./ui";
import { CAMPAIGN_STATUS_LABELS, PAYOUT_METHOD_LABELS, PLATFORM_LABELS, type Campaign } from "@/lib/types";
import { formatCompact } from "@/lib/format";

function toneFor(status: Campaign["status"]) {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  if (status === "pending") return "warning";
  return "default";
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [showPrivate, setShowPrivate] = useState(false);
  const detailHref = `/dashboard/campaigns/${campaign.slug}`;
  const isPrivate = campaign.status === "private";
  const isPot = campaign.payoutMode === "pot" && campaign.potValue;

  return (
    <>
      <Card className="flex flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-card bg-ink text-lg font-extrabold text-paper" aria-hidden>
            {campaign.name.slice(0, 1).toUpperCase()}
          </span>
          <Badge tone={toneFor(campaign.status)}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
        </div>

        <Link href={detailHref} className="text-base font-bold text-ink hover:underline">
          {campaign.name}
        </Link>
        <div className="tnum mt-1 text-xs text-ink-faint">
          {campaign.daysLeft} days left · Min {formatCompact(campaign.minViewsTotal)} views to qualify
        </div>

        <div className="mt-3">
          <span className="tnum text-2xl font-extrabold tracking-tight text-ink">
            ${formatCompact(isPot ? campaign.potValue! : campaign.ratePer100k)}
          </span>
          <span className="ml-1 text-sm text-ink-faint">
            {isPot ? "pot · split by view share" : "per 100K views"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {campaign.platforms.map((p) => (
            <span key={p} className="flex items-center gap-1.5 text-xs text-ink-soft">
              <PlatformDot platform={p} /> {PLATFORM_LABELS[p]}
            </span>
          ))}
        </div>
        <div className="mt-1.5 text-[11px] text-ink-faint">{PAYOUT_METHOD_LABELS[campaign.payoutMethod]}</div>

        <div className="mt-4 flex-1" />
        {isPrivate ? (
          <button
            type="button"
            onClick={() => setShowPrivate(true)}
            className="mt-2 block min-h-[44px] w-full rounded-full border border-line/15 py-2.5 text-sm font-semibold text-ink transition-colors duration-micro hover:bg-ink/5"
          >
            Apply for access
          </button>
        ) : (
          <Link
            href={detailHref}
            className="mt-2 block min-h-[44px] w-full rounded-full bg-ink/5 py-2.5 text-center text-sm font-semibold text-ink transition-colors duration-micro hover:bg-ink/10"
          >
            {campaign.isJoined ? "Open campaign" : "View campaign"}
          </Link>
        )}
      </Card>

      {showPrivate && (
        <Dialog title="Private campaign" subtitle={campaign.name} onClose={() => setShowPrivate(false)}>
          <p className="text-sm text-ink-soft">
            Private campaigns are invite-only. You&apos;ll see it here when a brand invites you.
          </p>
          <div className="mt-6">
            <Button className="w-full" onClick={() => setShowPrivate(false)}>Got it</Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
