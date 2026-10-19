/**
 * Pure payout math for the monthly payout cycle cron.
 *
 * No I/O, no framework imports — safe to unit test with node:test.
 * The route handler in app/api/cron/close-payout-cycle/route.ts imports
 * these; this module IS the money logic, so keep it dependency-free and
 * covered by tests/payout-math.test.ts.
 */

export interface ClipViews {
  userId: string;
  /**
   * PERIOD views — the views this clip gained DURING the cycle being
   * closed (latest snapshot minus the previous cycle's snapshot, clamped
   * at zero by the route). NOT the clip's cumulative lifetime view count.
   */
  views: number;
}

export interface PayoutRow {
  userId: string;
  views: number;
  clips: number;
  estimatedAmount: number;
}

/**
 * Minimum payout threshold in USD. A clipper only gets a `payouts` row for
 * a cycle when cycle earnings + carried balance >= MIN_PAYOUT_USD;
 * anything below is carried forward in `payout_carryover` (see the route's
 * PRODUCT ASSUMPTIONS). USD ($).
 */
export const MIN_PAYOUT_USD = 10;

/** First calendar day (YYYY-MM-DD) of the month containing dateStr. */
export function startOfMonth(dateStr: string): string {
  return dateStr.slice(0, 7) + "-01";
}

/** Last calendar day (YYYY-MM-DD) of the month containing dateStr. */
export function endOfMonth(dateStr: string): string {
  const d = new Date(dateStr.slice(0, 7) + "-01T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + 1, 0); // day 0 of next month = last day of this month
  return d.toISOString().slice(0, 10);
}

/** Round to whole cents. */
export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface PayoutOpts {
  /**
   * Clips with views < minViewsPerPost are dropped ENTIRELY — they are not
   * counted in the clipper's clip count either.
   */
  minViewsPerPost?: number;
  /**
   * After per-user aggregation, users whose total period views are
   * < minViewsPerTotal are dropped (no payout row, no carryover).
   */
  minViewsPerTotal?: number;
  /**
   * Platform take for this campaign (e.g. 0.2 = 20%). Negotiated per client,
   * stored on campaigns.platform_take_rate. Defaults to PLATFORM_TAKE_RATE.
   */
  takeRate?: number;
}

/**
 * Platform take: the DEFAULT cut retained by ClipForge (20%). The actual take
 * is negotiated per client and stored on campaigns.platform_take_rate —
 * this constant is only the fallback.
 * Clippers earn (1 - take). Brands are charged the full ratePer100k.
 */
export const PLATFORM_TAKE_RATE = 0.2;

/**
 * Aggregate per-clipper earnings from PER-CLIP PERIOD view counts.
 *
 * Earnings = (period views / 100,000) * ratePer100k * (1 - takeRate),
 * summed per user, rounded to cents. Clips with zero views contribute zero.
 * Rows with a zero (or negative) estimated amount are dropped — no $0 noise
 * rows for admin review (there is no dismiss action, only "mark paid").
 *
 * Sub-minimum earnings are NOT dropped here — the route applies
 * MIN_PAYOUT_USD via payout_carryover after this returns.
 */
export function computePayouts(
  clips: ClipViews[],
  ratePer100k: number,
  opts?: PayoutOpts
): PayoutRow[] {
  const minPost = opts?.minViewsPerPost ?? 0;
  const minTotal = opts?.minViewsPerTotal ?? 0;
  const takeRate = opts?.takeRate ?? PLATFORM_TAKE_RATE;
  const byUser = new Map<string, { views: number; clips: number }>();
  for (const clip of clips) {
    if (clip.views < minPost) continue; // dropped entirely, not counted
    const agg = byUser.get(clip.userId) ?? { views: 0, clips: 0 };
    agg.views += clip.views;
    agg.clips += 1;
    byUser.set(clip.userId, agg);
  }
  return [...byUser.entries()]
    .filter(([, agg]) => agg.views >= minTotal)
    .map(([userId, agg]) => ({
      userId,
      views: agg.views,
      clips: agg.clips,
      estimatedAmount: roundCents((agg.views / 100000) * ratePer100k * (1 - takeRate)),
    }))
    .filter((r) => r.estimatedAmount > 0);
}
