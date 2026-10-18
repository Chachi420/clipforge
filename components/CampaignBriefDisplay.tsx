import { ExternalLink } from "lucide-react";
import { Badge, Card, PlatformDot } from "@/components/ui";
import {
  PLATFORM_LABELS,
  PAYOUT_METHOD_LABELS,
  ELIGIBILITY_LABELS,
  type Campaign,
} from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { PROMO_FORMATS } from "@/components/brand/ContentRequirementsSection";

const PROMO_LABELS: Record<string, string> = Object.fromEntries(
  PROMO_FORMATS.map((f) => [f.value, f.label])
);

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm text-ink">{children}</dd>
    </div>
  );
}

/**
 * Clean, organized campaign brief display. Used on brand campaign detail
 * (Brief tab) and clipper campaign detail (for joined campaigns).
 * Groups: payout → content → requirements → rules. Skips empty sections.
 */
export default function CampaignBriefDisplay({ campaign }: { campaign: Campaign }) {
  const hasDuration =
    campaign.minDurationSec != null || campaign.maxDurationSec != null;
  const durationLabel =
    campaign.minDurationSec != null && campaign.maxDurationSec != null
      ? `${campaign.minDurationSec}–${campaign.maxDurationSec}s`
      : campaign.minDurationSec != null
        ? `${campaign.minDurationSec}s+`
        : campaign.maxDurationSec != null
          ? `Up to ${campaign.maxDurationSec}s`
          : null;

  const formats = (campaign.promoFormats ?? []).filter(Boolean);
  const ratios = (campaign.aspectRatios ?? []).filter(Boolean);
  const hashtags = (campaign.requiredHashtags ?? []).filter(Boolean);
  const tags = (campaign.requiredTags ?? []).filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Payout */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-ink">Payout</h3>
        <dl className="mt-2 divide-y divide-line/10">
          <Row label="Rate">
            {formatMoney(campaign.ratePer100k)} per 100k views · {PAYOUT_METHOD_LABELS[campaign.payoutMethod]}
          </Row>
          <Row label="Platforms">
            <span className="flex flex-wrap gap-2">
              {campaign.platforms.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5">
                  <PlatformDot platform={p} />
                  {PLATFORM_LABELS[p]}
                </span>
              ))}
            </span>
          </Row>
          <Row label="Min views">
            {campaign.minViewsPerPost.toLocaleString()} per post
            {campaign.minViewsTotal > 0 && ` · ${campaign.minViewsTotal.toLocaleString()} total`}
          </Row>
          {campaign.budgetCap != null && (
            <Row label="Budget cap">{formatMoney(campaign.budgetCap)}</Row>
          )}
        </dl>
      </Card>

      {/* What to make */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-ink">What to make</h3>
        <dl className="mt-2 divide-y divide-line/10">
          {formats.length > 0 && (
            <Row label="Format">
              <span className="flex flex-wrap gap-2">
                {formats.map((f) => (
                  <Badge key={f}>{PROMO_LABELS[f] ?? f}</Badge>
                ))}
              </span>
            </Row>
          )}
          {ratios.length > 0 && (
            <Row label="Aspect ratio">
              {ratios.join(" · ")}
            </Row>
          )}
          {durationLabel && <Row label="Length">{durationLabel}</Row>}
          <Row label="Clips expected">
            {campaign.minClipsExpected ?? 1} clip{(campaign.minClipsExpected ?? 1) === 1 ? "" : "s"} minimum
          </Row>
          {campaign.sourceMaterialUrl && (
            <Row label="Source material">
              <a
                href={campaign.sourceMaterialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink"
              >
                Open source files <ExternalLink size={13} />
              </a>
            </Row>
          )}
          {campaign.requiresPreapproval && (
            <Row label="Approval">
              <Badge tone="amber">Brand reviews each clip before it goes live</Badge>
            </Row>
          )}
        </dl>
      </Card>

      {/* Must include */}
      {(hashtags.length > 0 || tags.length > 0) && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink">Must include</h3>
          <dl className="mt-2 divide-y divide-line/10">
            {hashtags.length > 0 && (
              <Row label="Hashtags">
                <span className="flex flex-wrap gap-2">
                  {hashtags.map((h) => (
                    <code key={h} className="rounded bg-surface px-2 py-0.5 text-[13px]">
                      {h.startsWith("#") ? h : `#${h}`}
                    </code>
                  ))}
                </span>
              </Row>
            )}
            {tags.length > 0 && (
              <Row label="Tag">
                <span className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <code key={t} className="rounded bg-surface px-2 py-0.5 text-[13px]">
                      {t.startsWith("@") ? t : `@${t}`}
                    </code>
                  ))}
                </span>
              </Row>
            )}
          </dl>
        </Card>
      )}

      {/* Who can join */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-ink">Who can join</h3>
        <dl className="mt-2 divide-y divide-line/10">
          <Row label="Eligibility">
            {ELIGIBILITY_LABELS[campaign.eligibilityType ?? "open"]}
            {campaign.eligibilityType === "followers" && campaign.minFollowers
              ? ` · ${campaign.minFollowers.toLocaleString()}+ followers`
              : ""}
            {campaign.eligibilityType === "engagement" && campaign.minAvgViews
              ? ` · ${campaign.minAvgViews.toLocaleString()}+ avg views`
              : ""}
            {campaign.eligibilityType === "invite_only" ? " · by invitation" : ""}
          </Row>
        </dl>
      </Card>

      {/* Rules */}
      {campaign.rules?.trim() && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink">Rules & guidelines</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
            {campaign.rules}
          </p>
        </Card>
      )}
    </div>
  );
}
