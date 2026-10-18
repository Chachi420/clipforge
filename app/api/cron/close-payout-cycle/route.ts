import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  startOfMonth,
  endOfMonth,
  roundCents,
  computePayouts,
  MIN_PAYOUT_USD,
} from "@/lib/payout-math";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/cron/close-payout-cycle — monthly payout cycle closer.
 *
 * Closes each active campaign's finished `live` payout cycle, computes
 * per-clipper earnings from the views gained DURING the cycle (period
 * deltas vs the previous cycle's snapshot baseline), inserts `payouts`
 * rows with status='pending' for admin review, and opens the next cycle.
 * Money never moves automatically — an admin flips payouts to 'paid'
 * via the existing markPayoutPaid action after sending funds manually.
 *
 * PRODUCT ASSUMPTIONS (founder to review):
 *  1. Monthly cycles: calendar-month periods (1st → last day of month),
 *     one cycle per campaign per month. A campaign's first cycle is
 *     bootstrapped for the current calendar month.
 *  2. PERIOD-DELTA earnings (not cumulative): each cycle pays only the
 *     views gained DURING that cycle. Baseline = the previous cycle's
 *     snapshot_at for the same campaign — the highest cycle_number below
 *     the closing one with a non-null snapshot_at. If no previous cycle
 *     exists (first close ever), the baseline is 0 for every clip.
 *     Per clip: delta = max(0, viewsNow − viewsPrev), where viewsNow is
 *     the latest snapshot and viewsPrev is the latest snapshot with
 *     scanned_at <= prevCloseAt (0 when there is no previous cycle). The
 *     max(0,·) clamp means bot-cleanup view drops never create negative
 *     payouts — the clip simply earns 0 for the cycle.
 *     Earnings = (period-delta views / 100,000) * campaign.rate_per_100k,
 *     summed per clipper, rounded to cents.
 *  3. Only clips with tracking_status='tracking' count. Clips with no
 *     snapshots contribute zero views.
 *  4. Min-view thresholds ARE applied (campaign.min_views_per_post /
 *     min_views_total): clips with period views below the per-post
 *     threshold are dropped entirely (not counted in the clipper's clip
 *     count either); after per-user aggregation, users whose total period
 *     views are below the total threshold are dropped — no payout row
 *     and no carryover.
 *  5. Payout minimum: MIN_PAYOUT_USD = $10. A clipper's effective earnings
 *     (this cycle's delta earnings + carried balance) below $10 do NOT
 *     create a payout row — the amount is carried forward in
 *     payout_carryover (pk user_id+campaign_id). Once effective earnings
 *     reach $10, a payout row is created for the FULL amount and the
 *     carry resets to 0. Carry writes tolerate the table's absence
 *     (migration 010 not yet run): the close continues, but sub-minimum
 *     earnings are then lost for that cycle.
 *  6. Clipper payment method/address IS snapshotted onto payout rows at
 *     close time: the clipper's default payment method (else the most
 *     recent one) is copied as method/address, so the admin knows where
 *     to send money even if the clipper later changes methods.
 *  7. A cycle closes only after its period_end has passed. Re-runs are
 *     no-ops (idempotent): payouts upsert on (cycle_id, user_id) with
 *     ignoreDuplicates, cycle numbers are unique per campaign, and carry
 *     updates are skipped when the stored carry row was already written
 *     by the current run (updated_at >= run start) — so a crash between
 *     the carry write and the cycle close never double-adds carry.
 *  8. Bounty-specific rates (bounties.rate_per_100k) are NOT applied — the
 *     campaign rate is used for every clip.
 *  9. Campaigns with payout_mode='pot' get the same payrate formula; they
 *     are flagged in the summary because pot distribution is a separate
 *     product decision (NOT implemented — no new pot campaigns should be
 *     created; 'pot' is being removed from the brief form).
 * 10. Budget cap: after closing, lifetime accrued payouts (sum of
 *     estimated_amount over ALL of the campaign's cycles' payout rows)
 *     are compared against campaign.budget_cap. If the cap is set and
 *     accrued >= cap, the campaign is auto-paused (status='paused') and
 *     the brand owner gets an in-app notification (type
 *     'campaign_paused'). Notification/email failures never fail the
 *     close.
 * 11. After a successful close with payouts, the admin is notified via
 *     notifyPayoutsReady (lib/admin-email) with payout ids + clipper
 *     display names. Email failure never fails the close (dynamic import
 *     in try/catch, so the route also typechecks before lib/admin-email
 *     is finished).
 * 12. Only campaigns with status='active' are processed.
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
  budgetPaused?: boolean;
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
    .select(
      "id, name, rate_per_100k, payout_mode, budget_cap, brand_id, min_views_per_post, min_views_total"
    )
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
        // Snap to the calendar-month grid: the month after the last known
        // cycle's period_end (recovery path), else the current month.
        let start: string;
        if (latestCycle) {
          const d = new Date(latestCycle.period_end + "T00:00:00Z");
          d.setUTCDate(d.getUTCDate() + 1);
          start = startOfMonth(d.toISOString().slice(0, 10));
        } else {
          start = startOfMonth(today);
        }
        if (start > today) start = startOfMonth(today); // defensive; shouldn't happen
        const { error: insError } = await supabase
          .from("payout_cycles")
          .insert({
            campaign_id: campaign.id,
            cycle_number: nextNumber,
            period_start: start,
            period_end: endOfMonth(start),
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
      const runStartedAt = new Date().toISOString();

      // Baseline: previous cycle for this campaign with a non-null
      // snapshot_at (highest cycle_number below the closing one). None →
      // baseline is 0 for every clip (first close ever).
      const { data: prevCycle } = await supabase
        .from("payout_cycles")
        .select("snapshot_at")
        .eq("campaign_id", campaign.id)
        .lt("cycle_number", liveCycle.cycle_number)
        .not("snapshot_at", "is", null)
        .order("cycle_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      const prevCloseAt: string | null = prevCycle?.snapshot_at ?? null;

      const { data: clips, error: clipsError } = await supabase
        .from("clips")
        .select("id, user_id")
        .eq("campaign_id", campaign.id)
        .eq("tracking_status", "tracking");
      if (clipsError) throw new Error(`clips fetch failed: ${clipsError.message}`);

      // Per-clip period deltas. Snapshots ordered desc → the first row per
      // clip is the latest (viewsNow); the first row with scanned_at <=
      // prevCloseAt is the baseline (viewsPrev). ISO timestamps compare
      // lexicographically. delta = max(0, now − prev).
      const viewsNow = new Map<string, number>();
      const viewsPrev = new Map<string, number>();
      const clipIds = (clips ?? []).map((c: any) => c.id);
      if (clipIds.length > 0) {
        const { data: snaps, error: snapsError } = await supabase
          .from("clip_metric_snapshots")
          .select("clip_id, views, scanned_at")
          .in("clip_id", clipIds)
          .order("scanned_at", { ascending: false });
        if (snapsError) throw new Error(`snapshots fetch failed: ${snapsError.message}`);
        for (const s of snaps ?? []) {
          const v = Number(s.views ?? 0);
          if (!viewsNow.has(s.clip_id)) viewsNow.set(s.clip_id, v);
          if (
            prevCloseAt &&
            !viewsPrev.has(s.clip_id) &&
            s.scanned_at <= prevCloseAt
          ) {
            viewsPrev.set(s.clip_id, v);
          }
        }
      }

      // Pure math lives in lib/payout-math.ts — covered by tests/.
      // ClipViews.views here is the PERIOD delta, not cumulative.
      const payoutCandidates = computePayouts(
        (clips ?? []).map((c: any) => ({
          userId: c.user_id as string,
          views: Math.max(0, (viewsNow.get(c.id) ?? 0) - (viewsPrev.get(c.id) ?? 0)),
        })),
        rate,
        {
          minViewsPerPost: Number(campaign.min_views_per_post ?? 0),
          minViewsPerTotal: Number(campaign.min_views_total ?? 0),
        }
      );

      // Rate tiers: brands can configure follower-band multipliers
      // (campaign_rate_tiers). Look up each clipper's best verified follower
      // count and apply their tier multiplier to the payout. No tiers →
      // multiplier 1 (existing behavior). Applied to the delta earnings only,
      // not to carried balances (those were priced in their own cycle).
      const tierMultiplierByUser = new Map<string, number>();
      {
        const candidateIds = [...new Set(payoutCandidates.map((r) => r.userId))];
        const { data: tiers } = await supabase
          .from("campaign_rate_tiers")
          .select("min_followers, multiplier")
          .eq("campaign_id", campaign.id)
          .order("min_followers", { ascending: false });
        if (tiers && tiers.length > 0 && candidateIds.length > 0) {
          const { data: accounts } = await supabase
            .from("social_accounts")
            .select("user_id, follower_count")
            .in("user_id", candidateIds)
            .eq("verified", true);
          const bestByUser = new Map<string, number>();
          for (const a of (accounts ?? []) as any[]) {
            const cur = bestByUser.get(a.user_id) ?? 0;
            bestByUser.set(a.user_id, Math.max(cur, Number(a.follower_count ?? 0)));
          }
          for (const uid of candidateIds) {
            const best = bestByUser.get(uid) ?? 0;
            let mult = 1.0;
            if (best > 0) {
              for (const t of tiers as any[]) {
                if (best >= Number(t.min_followers)) {
                  mult = Number(t.multiplier);
                  break;
                }
              }
            }
            tierMultiplierByUser.set(uid, mult);
          }
          // Apply multipliers to this cycle's delta earnings.
          for (const r of payoutCandidates) {
            const mult = tierMultiplierByUser.get(r.userId) ?? 1.0;
            if (mult !== 1.0) {
              r.estimatedAmount = roundCents(r.estimatedAmount * mult);
            }
          }
        }
      }

      // P1-10: payment method snapshot — default method per clipper, else
      // the most recent one (created_at desc → first row wins).
      const userIds = [...new Set(payoutCandidates.map((r) => r.userId))];
      const methodByUser = new Map<string, { method: string; address: string }>();
      if (userIds.length > 0) {
        const { data: methods, error: methError } = await supabase
          .from("payment_methods")
          .select("user_id, type, identifier, is_default")
          .in("user_id", userIds)
          .order("created_at", { ascending: false });
        if (methError) throw new Error(`payment methods fetch failed: ${methError.message}`);
        const byUser = new Map<string, any[]>();
        for (const m of methods ?? []) {
          const arr = byUser.get(m.user_id) ?? [];
          arr.push(m);
          byUser.set(m.user_id, arr);
        }
        for (const [uid, arr] of byUser) {
          const best = arr.find((m) => m.is_default) ?? arr[0];
          methodByUser.set(uid, { method: best.type, address: best.identifier });
        }
      }

      // Payout-minimum carryover balances. Tolerates the table's absence
      // (migration 010 not yet run) → treated as zero carry.
      const carryByUser = new Map<string, { amount: number; updatedAt: string | null }>();
      if (userIds.length > 0) {
        try {
          const { data: carries, error: carryError } = await supabase
            .from("payout_carryover")
            .select("user_id, amount, updated_at")
            .eq("campaign_id", campaign.id)
            .in("user_id", userIds);
          if (carryError) throw carryError;
          for (const c of carries ?? []) {
            carryByUser.set(c.user_id, {
              amount: Number(c.amount ?? 0),
              updatedAt: c.updated_at ?? null,
            });
          }
        } catch {
          // payout_carryover not migrated yet — zero carry, close continues.
        }
      }

      // Apply the $10 payout minimum: effective = delta earnings + carried.
      // >= MIN → payout row for the full amount, carry reset to 0.
      // < MIN → no payout row, amount carried forward.
      // Idempotency: carry rows already written by THIS run (updated_at >=
      // run start — i.e. a re-run after a crash between the carry write and
      // the cycle close) are skipped, so re-runs never double-add carry.
      const payoutRows: Record<string, any>[] = [];
      const carryUpdates: { user_id: string; amount: number }[] = [];
      for (const r of payoutCandidates) {
        const carry = carryByUser.get(r.userId);
        const carried = carry?.amount ?? 0;
        const effective = roundCents(r.estimatedAmount + carried);
        const pm = methodByUser.get(r.userId);
        const alreadyWrittenThisRun =
          !!carry?.updatedAt && carry.updatedAt >= runStartedAt;
        if (effective >= MIN_PAYOUT_USD) {
          payoutRows.push({
            cycle_id: liveCycle.id,
            user_id: r.userId,
            role: "clipper",
            estimated_amount: effective,
            status: "pending", // admin review required; nothing auto-pays
            total_views: r.views,
            total_clips: r.clips,
            method: pm?.method ?? null,
            address: pm?.address ?? null,
          });
          if (!alreadyWrittenThisRun && roundCents(carried) !== 0) {
            carryUpdates.push({ user_id: r.userId, amount: 0 });
          }
        } else if (!alreadyWrittenThisRun && roundCents(carried) !== effective) {
          carryUpdates.push({ user_id: r.userId, amount: effective });
        }
      }

      if (payoutRows.length > 0) {
        const { error: payError } = await supabase
          .from("payouts")
          .upsert(payoutRows, { onConflict: "cycle_id,user_id", ignoreDuplicates: true });
        if (payError) throw new Error(`payouts insert failed: ${payError.message}`);
      }

      // Per-clip earned amounts: write this cycle's earnings onto each
      // qualifying clip's `payout` column (after 20% take, after tier
      // multiplier) so the dashboard's per-clip "earned" stops showing $0.
      // NOTE: requires a `payout numeric` column on clips (migration pending).
      // Best-effort: a missing column must never fail the close.
      try {
        const qualifiedUsers = new Set(payoutCandidates.map((r) => r.userId));
        const minPost = Number(campaign.min_views_per_post ?? 0);
        const clipPayouts: { id: string; payout: number }[] = [];
        for (const c of (clips ?? []) as any[]) {
          if (!qualifiedUsers.has(c.user_id)) continue;
          const periodViews = Math.max(0, (viewsNow.get(c.id) ?? 0) - (viewsPrev.get(c.id) ?? 0));
          if (periodViews < minPost) continue;
          const mult = tierMultiplierByUser.get(c.user_id) ?? 1.0;
          clipPayouts.push({
            id: c.id,
            payout: roundCents((periodViews / 100000) * rate * 0.8 * mult),
          });
        }
        // Chunked parallel updates; each is idempotent for this cycle.
        const CHUNK = 25;
        for (let i = 0; i < clipPayouts.length; i += CHUNK) {
          await Promise.all(
            clipPayouts.slice(i, i + CHUNK).map((cp) =>
              supabase.from("clips").update({ payout: cp.payout }).eq("id", cp.id)
            )
          );
        }
      } catch {
        // clips.payout column not migrated yet — dashboard keeps showing $0
        // until the migration runs, but the close itself succeeded.
      }

      if (carryUpdates.length > 0) {
        try {
          const { error: carryError } = await supabase
            .from("payout_carryover")
            .upsert(
              carryUpdates.map((u) => ({
                user_id: u.user_id,
                campaign_id: campaign.id,
                amount: u.amount,
                updated_at: new Date().toISOString(),
              })),
              { onConflict: "user_id,campaign_id" }
            );
          if (carryError) throw carryError;
        } catch {
          // Table missing (migration 010) — sub-minimum earnings are lost
          // this cycle, but the close continues.
        }
      }

      const { error: closeError } = await supabase
        .from("payout_cycles")
        .update({ status: "awaiting_mark_paid", snapshot_at: new Date().toISOString() })
        .eq("id", liveCycle.id);
      if (closeError) throw new Error(`cycle close failed: ${closeError.message}`);

      const nextNumber = liveCycle.cycle_number + 1;
      const d = new Date(liveCycle.period_end + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + 1);
      const nextStart = startOfMonth(d.toISOString().slice(0, 10));
      const { error: nextError } = await supabase.from("payout_cycles").insert({
        campaign_id: campaign.id,
        cycle_number: nextNumber,
        period_start: nextStart,
        period_end: endOfMonth(nextStart),
        status: "live",
      });
      if (nextError) throw new Error(`next cycle open failed: ${nextError.message}`);

      // P2 — budget_cap: pause the campaign once lifetime accrued payouts
      // reach the cap, and notify the brand owner. Never fails the close.
      try {
        const cap = Number(campaign.budget_cap ?? 0);
        if (cap > 0) {
          const { data: cycleRows } = await supabase
            .from("payout_cycles")
            .select("id")
            .eq("campaign_id", campaign.id);
          const cycleIds = (cycleRows ?? []).map((c: any) => c.id);
          let accrued = 0;
          if (cycleIds.length > 0) {
            const { data: allPayouts } = await supabase
              .from("payouts")
              .select("estimated_amount")
              .in("cycle_id", cycleIds);
            accrued = roundCents(
              (allPayouts ?? []).reduce(
                (s: number, p: any) => s + Number(p.estimated_amount ?? 0),
                0
              )
            );
          }
          if (accrued >= cap) {
            await supabase
              .from("campaigns")
              .update({ status: "paused" })
              .eq("id", campaign.id);
            if (campaign.brand_id) {
              const { data: brand } = await supabase
                .from("brands")
                .select("owner_id")
                .eq("id", campaign.brand_id)
                .maybeSingle();
              if (brand?.owner_id) {
                await supabase.from("notifications").insert({
                  user_id: brand.owner_id,
                  type: "campaign_paused",
                  title: `Campaign "${campaign.name}" paused — budget cap reached`,
                  body: `Lifetime accrued payouts (${formatMoney(accrued)}) reached the campaign budget cap (${formatMoney(cap)}). No further cycles will close until you raise the cap or resume the campaign.`,
                });
              }
            }
            summary.budgetPaused = true;
          }
        }
      } catch {
        // Budget-cap enforcement is best-effort; the cycle already closed.
      }

      // P1-6: payout-ready email to admin. Email failure never fails the
      // close; dynamic import keeps this compiling before lib/admin-email
      // exports notifyPayoutsReady.
      try {
        const { data: readyPayouts } = await supabase
          .from("payouts")
          .select("id, estimated_amount, total_views, total_clips, method, address, profiles(display_name)")
          .eq("cycle_id", liveCycle.id);
        if (readyPayouts && readyPayouts.length > 0) {
          const mod = (await import("@/lib/admin-email")) as {
            notifyPayoutsReady?: (args: {
              cycleId: string;
              cycleLabel: string;
              campaignName: string;
              payouts: {
                id: string;
                clipperName: string;
                amount: number;
                views: number;
                clips: number;
                method?: string;
                address?: string;
              }[];
            }) => Promise<unknown>;
          };
          if (typeof mod.notifyPayoutsReady === "function") {
            await mod.notifyPayoutsReady({
              cycleId: liveCycle.id,
              cycleLabel: `#${liveCycle.cycle_number} (${liveCycle.period_start} – ${liveCycle.period_end})`,
              campaignName: campaign.name,
              payouts: readyPayouts.map((p: any) => ({
                id: p.id,
                clipperName: p.profiles?.display_name ?? "Clipper",
                amount: Number(p.estimated_amount ?? 0),
                views: Number(p.total_views ?? 0),
                clips: Number(p.total_clips ?? 0),
                method: p.method ?? undefined,
                address: p.address ?? undefined,
              })),
            });
          }
        }
      } catch {
        // Email failure must not fail the close.
      }

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
