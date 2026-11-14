import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCampaignDetail } from "@/lib/admin-actions";
import CampaignBriefDisplay from "@/components/CampaignBriefDisplay";
import CampaignDetailActions from "@/components/admin/CampaignDetailActions";
import { Badge, Card } from "@/components/ui";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "blue" | undefined> = {
  active: "green",
  pending: "amber",
  paused: "blue",
  private: undefined,
};

const TYPE_LABELS: Record<string, string> = {
  per_view: "Pay per view",
  bounty: "Bounty",
  pot: "Prize pot",
};

export default async function CampaignAdminDetailPage({ params }: { params: { slug: string } }) {
  const detail = await getAdminCampaignDetail(params.slug);
  if (!detail) notFound();
  const { campaign, bounties, brandName, clipCount } = detail;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <Link href="/admin/campaigns" className="text-sm font-medium text-ink-soft hover:text-ink">
          ← All campaigns
        </Link>
        <h1 className="display mt-2 text-3xl">{campaign.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone={STATUS_TONE[campaign.status]}>{campaign.status}</Badge>
          <Badge>{TYPE_LABELS[campaign.type] ?? campaign.type}</Badge>
          <Badge tone="blue">{campaign.category}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Brand: {brandName} · {clipCount} clip{clipCount === 1 ? "" : "s"} submitted · Slug: {campaign.slug}
        </p>
        <p className="mt-1 font-mono text-xs text-ink-faint">{campaign.id}</p>
      </div>

      <CampaignDetailActions campaignId={campaign.id} campaignName={campaign.name} status={campaign.status} />

      <CampaignBriefDisplay campaign={campaign} />

      <section className="space-y-3">
        <h2 className="display text-xl">Bounties ({bounties.length})</h2>
        {bounties.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No bounties on this campaign. The standard rate applies to every clip.
          </p>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
                    <th className="px-4 py-3">Bounty</th>
                    <th className="px-4 py-3 text-right">Rate / 100k</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Budget cap</th>
                    <th className="px-4 py-3">Requirements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {bounties.map((b) => (
                    <tr key={b.id} className="align-top transition hover:bg-ink/[0.03]">
                      <td className="px-4 py-3 font-medium text-ink">{b.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">{formatMoney(b.ratePer100k)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={b.isActive ? "green" : undefined}>{b.isActive ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-ink-soft">
                        {b.budgetCap != null ? formatMoney(b.budgetCap) : "—"}
                      </td>
                      <td className="max-w-md px-4 py-3 text-ink-soft">
                        <p className="whitespace-pre-wrap break-words">{b.requirements ?? "—"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href={`/dashboard/campaigns/${campaign.slug}`} className="font-medium text-ink hover:underline">
          View as clipper →
        </Link>
        <Link href="/admin/clips" className="font-medium text-ink hover:underline">
          All clips →
        </Link>
      </div>
    </div>
  );
}
