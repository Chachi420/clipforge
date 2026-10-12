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
  views: number;
}

export interface PayoutRow {
  userId: string;
  views: number;
  clips: number;
  estimatedAmount: number;
}

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

/**
 * Aggregate per-clipper earnings from cumulative per-clip view counts.
 *
 * Earnings = (views / 100,000) * ratePer100k, summed per user, rounded to
 * cents. Clips with zero views contribute zero. Rows with a zero (or
 * negative) estimated amount are dropped — no $0 noise rows for admin
 * review (there is no dismiss action, only "mark paid").
 */
export function computePayouts(
  clips: ClipViews[],
  ratePer100k: number
): PayoutRow[] {
  const byUser = new Map<string, { views: number; clips: number }>();
  for (const clip of clips) {
    const agg = byUser.get(clip.userId) ?? { views: 0, clips: 0 };
    agg.views += clip.views;
    agg.clips += 1;
    byUser.set(clip.userId, agg);
  }
  return [...byUser.entries()]
    .map(([userId, agg]) => ({
      userId,
      views: agg.views,
      clips: agg.clips,
      estimatedAmount: roundCents((agg.views / 100000) * ratePer100k),
    }))
    .filter((r) => r.estimatedAmount > 0);
}
