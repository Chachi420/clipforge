import Link from "next/link";
import { getAdminCampaigns } from "@/lib/admin-actions";
import CampaignAdminTable from "@/components/admin/CampaignAdminTable";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "pending", label: "Pending approval" },
  { key: "active", label: "Live" },
  { key: "paused", label: "Paused" },
  { key: "all", label: "All campaigns" },
];

export default async function CampaignsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = FILTERS.some((f) => f.key === status) ? status! : "pending";
  const campaigns = await getAdminCampaigns(filter);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Campaigns</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every campaign on the platform. {campaigns.length} in this view.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/campaigns?status=${f.key}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink/40 hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <CampaignAdminTable initial={campaigns} />
    </div>
  );
}
