import { notFound } from "next/navigation";
import { requireBrand } from "@/lib/brand-actions";
import {
  getBrandCampaign,
  getCampaignClippers,
  getCampaignClips,
  getViewsTimeseries,
} from "@/lib/brand-db";
import { getBounties } from "@/lib/db";
import { Badge, Card, Stat } from "@/components/ui";
import { CAMPAIGN_STATUS_LABELS, type CampaignStatus } from "@/lib/types";
import { formatCompact, formatMoney } from "@/lib/format";
import PauseResumeButton from "./PauseResumeButton";
import ViewsChart from "./ViewsChart";
import CampaignTabs from "./CampaignTabs";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<CampaignStatus, "green" | "amber" | "default" | "blue"> = {
  active: "green",
  pending: "amber",
  paused: "default",
  private: "blue",
};

export default async function BrandCampaignDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { brand } = await requireBrand();
  const campaign = await getBrandCampaign(brand.id, params.slug);
  if (!campaign) notFound();

  const [timeseries, clips, clippers, bounties] = await Promise.all([
    getViewsTimeseries(brand.id, campaign.id, 30),
    getCampaignClips(brand.id, campaign.id, 50),
    getCampaignClippers(brand.id, campaign.id),
    getBounties(campaign.id),
  ]);

  const ecpm = campaign.totalViews > 0 ? (campaign.spend / campaign.totalViews) * 1000 : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-white">{campaign.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONES[campaign.status]}>
              {CAMPAIGN_STATUS_LABELS[campaign.status]}
            </Badge>
            <Badge>{campaign.category}</Badge>
            <Badge tone="blue">{campaign.daysLeft} days left</Badge>
          </div>
        </div>
        <div className="flex-1" />
        <PauseResumeButton
          campaignId={campaign.id}
          status={campaign.status}
        />
      </div>

      {/* KPI row */}
      <Card className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-5">
        <Stat label="Verified views" value={formatCompact(campaign.totalViews)} />
        <Stat label="Spend" value={formatMoney(campaign.spend)} />
        <Stat label="eCPM" value={formatMoney(ecpm)} sub="spend per 1k views" />
        <Stat label="Clips live" value={String(campaign.clipCount)} />
        <Stat label="Clippers" value={String(campaign.clipperCount)} />
      </Card>

      {/* Views chart */}
      <ViewsChart data={timeseries} />

      {/* Tabs */}
      <CampaignTabs
        campaign={campaign}
        clips={clips}
        clippers={clippers}
        bounties={bounties}
      />
    </div>
  );
}
