import { Check, Minus, X } from "lucide-react";
import { Card } from "./ui";

/**
 * Honest competitor comparison for the pricing page.
 * Only claims Wondeed can verify from its own codebase are marked
 * as Wondeed strengths. Competitor figures come from their public
 * marketing pages (Oct 2026) — labeled as reported, not audited.
 */

type Cell = { text: string; tone: "good" | "neutral" | "bad" } | { check: true } | { cross: true } | { dash: true };

interface Row {
  label: string;
  wondeed: Cell;
  clipaffiliates: Cell;
  whop: Cell;
  vyro: Cell;
}

const ROWS: Row[] = [
  {
    label: "Platform fee",
    wondeed: { text: "20% of brand rate", tone: "neutral" },
    clipaffiliates: { text: "9% on deposits", tone: "good" },
    whop: { text: "15–30%", tone: "bad" },
    vyro: { text: "Varies by campaign", tone: "neutral" },
  },
  {
    label: "View verification",
    wondeed: { text: "API-verified (YouTube); fraud checks", tone: "good" },
    clipaffiliates: { text: "API-verified", tone: "good" },
    whop: { text: "Campaign-dependent", tone: "neutral" },
    vyro: { text: "API-verified + fraud checks", tone: "good" },
  },
  {
    label: "Campaign setup time",
    wondeed: { text: "Minutes", tone: "good" },
    clipaffiliates: { text: "Minutes", tone: "good" },
    whop: { text: "Minutes", tone: "good" },
    vyro: { text: "Minutes", tone: "good" },
  },
  {
    label: "Minimum campaign budget",
    wondeed: { text: "No minimum", tone: "good" },
    clipaffiliates: { text: "No published minimum", tone: "neutral" },
    whop: { text: "Campaign-dependent", tone: "neutral" },
    vyro: { text: "$1,000", tone: "bad" },
  },
  {
    label: "Clipper payout methods",
    wondeed: { text: "PayPal, crypto", tone: "neutral" },
    clipaffiliates: { text: "Crypto", tone: "neutral" },
    whop: { text: "Varies", tone: "neutral" },
    vyro: { text: "Stripe, PayPal", tone: "good" },
  },
  {
    label: "Minimum payout",
    wondeed: { text: "$10", tone: "neutral" },
    clipaffiliates: { text: "Not published", tone: "neutral" },
    whop: { text: "Campaign-dependent", tone: "neutral" },
    vyro: { text: "No minimum", tone: "good" },
  },
  {
    label: "Brand approval window",
    wondeed: { text: "Admin-reviewed", tone: "good" },
    clipaffiliates: { text: "72 hours", tone: "good" },
    whop: { text: "Campaign-dependent", tone: "neutral" },
    vyro: { text: "Pre-publication review", tone: "good" },
  },
  {
    label: "India-first (₹, UPI)",
    wondeed: { check: true },
    clipaffiliates: { cross: true },
    whop: { cross: true },
    vyro: { cross: true },
  },
];

function CellView({ cell }: { cell: Cell }) {
  if ("check" in cell) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper">
        <Check size={14} aria-label="Yes" />
      </span>
    );
  }
  if ("cross" in cell) {
    return <X size={16} className="text-ink-faint" aria-label="No" />;
  }
  if ("dash" in cell) {
    return <Minus size={16} className="text-ink-faint" aria-label="Not applicable" />;
  }
  const color =
    cell.tone === "good"
      ? "font-semibold text-ink"
      : cell.tone === "bad"
        ? "text-ink-faint"
        : "text-ink-soft";
  return <span className={`text-sm ${color}`}>{cell.text}</span>;
}

export default function ComparisonTable() {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line/10">
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Feature
              </th>
              <th className="bg-ink px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-paper">
                Wondeed
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                ClipAffiliates
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Whop
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Vyro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/10">
            {ROWS.map((row) => (
              <tr key={row.label} className="transition-colors duration-micro hover:bg-ink/[0.02]">
                <td className="px-5 py-3.5 text-sm font-medium text-ink">{row.label}</td>
                <td className="bg-ink/[0.04] px-5 py-3.5">
                  <CellView cell={row.wondeed} />
                </td>
                <td className="px-5 py-3.5">
                  <CellView cell={row.clipaffiliates} />
                </td>
                <td className="px-5 py-3.5">
                  <CellView cell={row.whop} />
                </td>
                <td className="px-5 py-3.5">
                  <CellView cell={row.vyro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line/10 px-5 py-3 text-xs text-ink-faint">
        Competitor figures from their public pages, Oct 2026 — reported, not audited.
        Wondeed figures from our live product.
      </p>
    </Card>
  );
}
