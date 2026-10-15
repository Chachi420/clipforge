"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Trophy, Wallet } from "lucide-react";
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
  // Legacy: pot mode was removed from the product, but old rows may still
  // carry a pot value — render it honestly rather than dropping the number.
  const isPot = campaign.payoutMode === "pot" && campaign.potValue;
  const rate = isPot ? campaign.potValue! : campaign.ratePer100k;

  return (
    <>
      <Card className="flex flex-col p-5 transition-colors duration-micro hover:border-ink/25">
        {/* Header: brand mark, name, status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-ink text-lg font-extrabold text-paper" aria-hidden>
              {campaign.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <Link href={detailHref} className="block truncate text-base font-bold text-ink hover:underline">
                {campaign.name}
              </Link>
              <div className="micro-label mt-0.5">{campaign.category}</div>
            </div>
          </div>
          <Badge tone={toneFor(campaign.status)}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
        </div>

        {/* Meta: time + qualification */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-ink-faint" aria-hidden />
            {campaign.daysLeft} days left
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={13} className="text-ink-faint" aria-hidden />
            Min {formatCompact(campaign.minViewsTotal)} views to qualify
          </span>
        </div>

        {/* Rate hero */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-card bg-ink/[0.04] px-4 py-3.5">
          <div className="flex items-baseline gap-2">
            <span className="tnum text-[28px] font-extrabold leading-none tracking-tight text-ink">
              ${formatCompact(rate)}
            </span>
            <span className="text-xs text-ink-faint">
              {isPot ? "pot · split by view share" : "per 100K views"}
            </span>
          </div>
          {campaign.type === "bounty" && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-paper">
              <Trophy size={11} aria-hidden /> Bounties
            </span>
          )}
        </div>

        {/* Platforms + payout */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {campaign.platforms.map((p) => (
            <span key={p} className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
              <PlatformDot platform={p} /> {PLATFORM_LABELS[p]}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
          <Wallet size={11} aria-hidden /> {PAYOUT_METHOD_LABELS[campaign.payoutMethod]}
        </div>

        <div className="mt-4 flex-1" />
        {isPrivate ? (
          <button
            type="button"
            onClick={() => setShowPrivate(true)}
            className="pill mt-2 flex min-h-[48px] w-full items-center justify-center border border-ink/20 text-sm font-semibold text-ink transition-colors duration-micro hover:bg-ink/5"
          >
            Apply for access
          </button>
        ) : (
          <Link
            href={detailHref}
            className="pill btn-liquid mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-paper"
          >
            {campaign.isJoined ? "Open campaign" : "View campaign"} <ArrowRight size={15} aria-hidden />
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
