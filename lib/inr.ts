/**
 * INR-native formatting helpers for the India market.
 *
 * Existing USD displays are left untouched — these are for new dual-display
 * usage where showing both currencies makes sense (brand dashboards,
 * campaign cards, payout summaries).
 */

/** Approximate USD → INR rate. Kept as a named constant so it's easy to
 *  update or wire to a live rate later. */
export const USD_TO_INR = 83;

/** Convert USD to INR. Rounds to whole rupees. */
export function usdToInr(usd: number): number {
  return Math.round(usd * USD_TO_INR);
}

/**
 * Format a USD amount as INR in Indian style: ₹1,00,000 (lakh/crore
 * grouping via the en-IN locale), no decimals for whole rupees.
 */
export function formatINR(usd: number): string {
  const inr = usdToInr(usd);
  return "₹" + inr.toLocaleString("en-IN");
}

/**
 * Format a USD amount with two decimals, e.g. $1,250.00.
 * (Thin wrapper so dual displays share one code path.)
 */
export function formatUSD(usd: number): string {
  return (
    "$" +
    usd.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Dual display: "$1,250.00 / ₹1,03,750". */
export function formatDual(usd: number): string {
  return `${formatUSD(usd)} / ${formatINR(usd)}`;
}

/** Compact dual display for tight spaces: "$1.25k / ₹1.04L". */
export function formatDualCompact(usd: number): string {
  const inr = usdToInr(usd);
  const inrShort =
    inr >= 10000000
      ? `${(inr / 10000000).toFixed(2)}Cr`
      : inr >= 100000
        ? `${(inr / 100000).toFixed(2)}L`
        : inr >= 1000
          ? `${(inr / 1000).toFixed(1)}k`
          : `${inr}`;
  const usdShort =
    usd >= 1000000
      ? `$${(usd / 1000000).toFixed(2)}M`
      : usd >= 1000
        ? `$${(usd / 1000).toFixed(2)}k`
        : formatUSD(usd);
  return `${usdShort} / ₹${inrShort}`;
}
