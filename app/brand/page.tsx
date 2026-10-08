import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState, NightCard, Stat } from "@/components/ui";
import { requireBrand } from "@/lib/brand-actions";
import { getBrandCampaigns, getBrandKpis } from "@/lib/brand-db";
import { isLive } from "@/lib/db";
import { formatCompact, formatMoney } from "@/lib/format";
import CampaignTable from "./_components/CampaignTable";
import NewCampaignButton from "./_components/NewCampaignButton";

export const dynamic = "force-dynamic";

export default async function BrandOverviewPage() {
  let brandName = "Demo Brand";
  let brandId = "demo-brand";
  if (isLive()) {
    const ctx = await requireBrand();
    brandName = ctx.brand.name;
    brandId = ctx.brandId;
  }

  const [kpis, campaigns] = await Promise.all([
    getBrandKpis(brandId),
    getBrandCampaigns(brandId),
  ]);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-3xl">{brandName}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Spend, views and clips across your campaigns.
          </p>
        </div>
        <NewCampaignButton />
      </div>

      <NightCard className="p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Stat
            dark
            label="Active campaigns"
            value={String(kpis.activeCampaigns)}
            sub="Live now"
          />
          <Stat
            dark
            label="Spend MTD"
            value={formatMoney(kpis.spendMtd)}
            sub="Verified views spend"
          />
          <Stat
            dark
            label="Verified views MTD"
            value={formatCompact(kpis.viewsMtd)}
            sub="This month"
          />
          <Stat
            dark
            label="Avg eCPM"
            value={formatMoney(kpis.avgEcpm)}
            sub="Per 1,000 views"
          />
        </div>
      </NightCard>

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          body="Submit your first brief to start getting clips from clippers."
          action={<NewCampaignButton />}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Campaigns</h2>
            <Link
              href="/brand/campaigns"
              className="inline-flex items-center gap-1 text-sm font-semibold text-lime-deep hover:text-ink"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <CampaignTable campaigns={campaigns} />
        </div>
      )}
    </div>
  );
}
