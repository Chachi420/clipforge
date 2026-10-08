import { getPendingCampaigns } from "@/lib/admin-actions";
import CampaignApprovalQueue from "@/components/admin/CampaignApprovalQueue";

export const dynamic = "force-dynamic";

export default async function CampaignApprovalsPage() {
  const pending = await getPendingCampaigns();
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-3xl">Campaign approvals</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {pending.length} campaign brief{pending.length === 1 ? "" : "s"} awaiting approval.
          </p>
        </div>
      </div>
      <CampaignApprovalQueue initial={pending} />
    </div>
  );
}
