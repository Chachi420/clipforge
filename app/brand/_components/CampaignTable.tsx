import Link from "next/link";
import { Badge, Card, ProgressBar } from "@/components/ui";
import { formatCompact, formatMoney } from "@/lib/format";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/types";
import type { BrandCampaign, CampaignStatus } from "@/lib/types";

const STATUS_TONE: Record<CampaignStatus, "default" | "green" | "amber" | "blue"> = {
  active: "green",
  pending: "amber",
  paused: "default",
  private: "blue",
};

/** Shared brand campaign table. Server component; parent must wrap in
 *  overflow-x-auto-safe container — this renders its own. */
export default function CampaignTable({ campaigns }: { campaigns: BrandCampaign[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3 font-semibold">Campaign</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Spend vs budget</th>
              <th className="px-4 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 font-semibold">Clips</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr
                key={c.id}
                className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/brand/campaigns/${c.slug}`}
                    className="font-semibold text-white hover:text-accent-soft"
                  >
                    {c.name}
                  </Link>
                  <div className="mt-0.5 text-xs text-white/40">{c.category}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[c.status]}>{CAMPAIGN_STATUS_LABELS[c.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  {c.budgetCap != null && c.budgetCap > 0 ? (
                    <div className="min-w-[150px]">
                      <ProgressBar pct={(c.spend / c.budgetCap) * 100} />
                      <div className="mt-1.5 text-xs text-white/60">
                        {formatMoney(c.spend)}{" "}
                        <span className="text-white/30">of {formatMoney(c.budgetCap)}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-white/40">No cap</div>
                      <div className="mt-0.5 text-xs text-white/60">
                        {formatMoney(c.spend)} spent
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-white/80">{formatCompact(c.totalViews)}</td>
                <td className="px-4 py-3 text-white/80">{c.clipCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
