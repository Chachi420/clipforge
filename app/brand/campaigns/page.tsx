import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { requireBrand } from "@/lib/brand-actions";
import { getBrandCampaigns } from "@/lib/brand-db";
import { isLive } from "@/lib/db";
import type { CampaignStatus } from "@/lib/types";
import CampaignTable from "../_components/CampaignTable";
import NewCampaignButton from "../_components/NewCampaignButton";

export const dynamic = "force-dynamic";

interface Tab {
  key: string;
  label: string;
  status?: CampaignStatus;
}

const TABS: Tab[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active", status: "active" },
  { key: "pending", label: "Pending", status: "pending" },
  { key: "paused", label: "Paused", status: "paused" },
  { key: "private", label: "Ended", status: "private" },
];

export default async function BrandCampaignsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  let brandId = "demo-brand";
  if (isLive()) {
    ({ brandId } = await requireBrand());
  }

  const campaigns = await getBrandCampaigns(brandId);

  const raw = typeof searchParams?.status === "string" ? searchParams.status : "all";
  const activeKey = TABS.some((t) => t.key === raw) ? raw : "all";
  const activeTab = TABS.find((t) => t.key === activeKey) ?? TABS[0];
  const filtered = activeTab.status
    ? campaigns.filter((c) => c.status === activeTab.status)
    : campaigns;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-3xl">Campaigns</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Every brief you have submitted, across all statuses.
          </p>
        </div>
        <NewCampaignButton />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/brand/campaigns" : `/brand/campaigns?status=${t.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              t.key === activeKey
                ? "bg-electric text-white shadow-card"
                : "text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          body="Submit your first brief to start getting clips from clippers."
          action={<NewCampaignButton />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.label.toLowerCase()} campaigns`}
          body="Nothing matches this filter yet."
        />
      ) : (
        <CampaignTable campaigns={filtered} />
      )}
    </div>
  );
}
