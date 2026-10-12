import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/cron/close-payout-cycle — weekly payout cycle closer.
 *
 * Closes each active campaign's finished `live` payout cycle, computes
 * per-clipper earnings from the LATEST metric snapshot per clip, inserts
 * `payouts` rows with status='pending' for admin review, and opens the next
 * cycle. Money never moves automatically — an admin flips payouts to 'paid'
 * via the existing markPayoutPaid action after sending funds manually.
 *
 * PRODUCT ASSUMPTIONS (founder to review):
 *  1. Weekly cycles: 7-day periods (period_start..period_end inclusive),
 *     chained from the previous cycle. A campaign's first cycle is
 *     bootstrapped starting today.
 *  2. Earnings = (latest snapshot views per clip, CUMULATIVE — not period
 *     deltas) / 100,000 * campaign.rate_per_100k, summed per clipper,
 *     rounded to cents.
 *  3. Only clips with tracking_status='tracking' count. Clips with no
 *     snapshots contribute zero views.
 *  4. Payout rows are created only when estimated_amount > 0 — no $0 noise
 *     rows for the admin to dismiss (there is no dismiss action, only
 *     "mark paid").
 *  5. A cycle closes only after its period_end has passed. Re-runs are
 *     no-ops (idempotent): payouts upsert on (cycle_id, user_id) with
 *     ignoreDuplicates, and cycle numbers are unique per campaign.
 *  6. min_views_per_post / min_views_total thresholds are NOT applied.
 *  7. Bounty-specific rates (bounties.rate_per_100k) are NOT applied — the
 *     campaign rate is used for every clip.
 *  8. Campaigns with payout_mode='pot' get the same payrate formula; they
 *     are flagged in the summary because pot distribution is a separate
 *     product decision.
 *  9. Clipper payment method/address is NOT copied onto payout rows
 *     (payment_methods.identifier may be masked; the admin UI renders null
 *     as "Not set").
 * 10. Only campaigns with status='active' are processed.
 *
 * Auth: fails closed. CRON_SECRET must be set (503 otherwise) and presented
 * as `Authorization: Bearer <secret>` (401 otherwise). Unlike scan-clips,
 * there is NO user-agent bypass — this job writes financial rows, so
 * spoofable auth is unacceptable.
 */

interface CampaignSummary {
  campaignId: string;
  campaignName: string;
  action: "closed" | "bootstrapped" | "skipped";
  closedCycleNumber?: number;
  newCycleNumber?: number;
  payoutsCreated?: number;
  totalEstimated?: number;
  potMode?: boolean;
  reason?: string;
}

interface CloseResult {
  date: string;
  closed: number;
  bootstrapped: number;
  skipped: number;
  payoutsCreated: number;
  totalEstimated: number;
  campaigns: CampaignSummary[];
  errors: string[];
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured — refusing to run" },
      { status: 503 }
    );
  }
  const header = request.headers.get("authorization") ?? "";
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service client not configured" },
      { status: 503 }
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const result: CloseResult = {
    date: today,
    closed: 0,
    bootstrapped: 0,
    skipped: 0,
    payoutsCreated: 0,
    totalEstimated: 0,
    campaigns: [],
    errors: [],
  };

  const { data: campaigns, error: campError } = await supabase
    .from("campaigns")
    .select("id, name, rate_per_100k, payout_mode")
    .eq("status", "active");

  if (campError) {
    return NextResponse.json({ error: campError.message }, { status: 500 });
  }

  for (const campaign of campaigns ?? []) {
    const rate = Number(campaign.rate_per_100k ?? 0);
    const summary: CampaignSummary = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      action: "skipped",
      potMode: campaign.payout_mode === "pot",
    };

    try {
      // Latest cycle of any status (for numbering + period chaining).
      const { data: latestCycle } = await supabase
        .from("payout_cycles")
        .select("id, cycle_number, period_start, period_end, status")
        .eq("campaign_id", campaign.id)
        .order("cycle_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      const liveCycle =
        latestCycle?.status === "live" ? latestCycle : null;

      // --- Case 1: no live cycle → bootstrap the cadence, don't close. ---
      if (!liveCycle) {
        const nextNumber = (latestCycle?.cycle_number ?? 0) + 1;
        let start = latestCycle ? addDays(latestCycle.period_end, 1) : today;
        if (start > today) start = today; // defensive; shouldn't happen
        const { error: insError } = await supabase
          .from("payout_cycles")
          .insert({
            campaign_id: campaign.id,
            cycle_number: nextNumber,
            period_start: start,
            period_end: addDays(start, 6),
            status: "live",
          });
        if (insError) throw new Error(`bootstrap cycle failed: ${insError.message}`);
        summary.action = "bootstrapped";
        summary.newCycleNumber = nextNumber;
        result.bootstrapped += 1;
        result.campaigns.push(summary);
        continue;
      }

      // --- Case 2: live cycle still inside its period → nothing to do. ---
      if (liveCycle.period_end >= today) {
        summary.action = "skipped";
        summary.reason = `cycle #${liveCycle.cycle_number} live until ${liveCycle.period_end}`;
        result.skipped += 1;
        result.campaigns.push(summary);
        continue;
      }

      // --- Case 3: live cycle's period has ended → close it. ---
      const { data: clips, error: clipsError } = await supabase
        .from("clips")
        .select("id, user_id")
        .eq("campaign_id", campaign.id)
        .eq("tracking_status", "tracking");
      if (clipsError) throw new Error(`clips fetch failed: ${clipsError.message}`);

      // Latest snapshot per clip (ordered desc → first row per clip wins).
      const latestViews = new Map<string, number>();
      const clipIds = (clips ?? []).map((c: any) => c.id);
      if (clipIds.length > 0) {
        const { data: snaps, error: snapsError } = await supabase
          .from("clip_metric_snapshots")
          .select("clip_id, views")
          .in("clip_id", clipIds)
          .order("scanned_at", { ascending: false });
        if (snapsError) throw new Error(`snapshots fetch failed: ${snapsError.message}`);
        for (const s of snaps ?? []) {
          if (!latestViews.has(s.clip_id)) {
            latestViews.set(s.clip_id, Number(s.views ?? 0));
          }
        }
      }

      // Aggregate per clipper. Clips with no snapshots contribute zero views.
      const byUser = new Map<string, { views: number; clips: number }>();
      for (const clip of clips ?? []) {
        const views = latestViews.get(clip.id) ?? 0;
        const agg = byUser.get(clip.user_id) ?? { views: 0, clips: 0 };
        agg.views += views;
        agg.clips += 1;
        byUser.set(clip.user_id, agg);
      }

      const payoutRows = [...byUser.entries()]
        .map(([userId, agg]) => ({
          cycle_id: liveCycle.id,
          user_id: userId,
          role: "clipper",
          estimated_amount: roundCents((agg.views / 100000) * rate),
          status: "pending", // admin review required; nothing auto-pays
          total_views: agg.views,
          total_clips: agg.clips,
        }))
        .filter((r) => r.estimated_amount > 0);

      if (payoutRows.length > 0) {
        const { error: payError } = await supabase
          .from("payouts")
          .upsert(payoutRows, { onConflict: "cycle_id,user_id", ignoreDuplicates: true });
        if (payError) throw new Error(`payouts insert failed: ${payError.message}`);
      }

      const { error: closeError } = await supabase
        .from("payout_cycles")
        .update({ status: "awaiting_mark_paid", snapshot_at: new Date().toISOString() })
        .eq("id", liveCycle.id);
      if (closeError) throw new Error(`cycle close failed: ${closeError.message}`);

      const nextNumber = liveCycle.cycle_number + 1;
      const nextStart = addDays(liveCycle.period_end, 1);
      const { error: nextError } = await supabase.from("payout_cycles").insert({
        campaign_id: campaign.id,
        cycle_number: nextNumber,
        period_start: nextStart,
        period_end: addDays(nextStart, 6),
        status: "live",
      });
      if (nextError) throw new Error(`next cycle open failed: ${nextError.message}`);

      const cycleTotal = roundCents(
        payoutRows.reduce((s, r) => s + r.estimated_amount, 0)
      );
      summary.action = "closed";
      summary.closedCycleNumber = liveCycle.cycle_number;
      summary.newCycleNumber = nextNumber;
      summary.payoutsCreated = payoutRows.length;
      summary.totalEstimated = cycleTotal;
      result.closed += 1;
      result.payoutsCreated += payoutRows.length;
      result.totalEstimated = roundCents(result.totalEstimated + cycleTotal);
      if (summary.potMode) {
        result.errors.push(
          `campaign "${campaign.name}": payout_mode='pot' — payrate formula applied; pot distribution not implemented`
        );
      }
      result.campaigns.push(summary);
    } catch (e: any) {
      summary.action = "skipped";
      summary.reason = e?.message ?? "unknown error";
      result.errors.push(`campaign "${campaign.name}": ${summary.reason}`);
      result.campaigns.push(summary);
    }
  }

  return NextResponse.json(result);
}
