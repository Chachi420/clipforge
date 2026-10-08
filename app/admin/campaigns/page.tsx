import { getPendingCampaigns } from "@/lib/admin-actions";
import CampaignApprovalQueue from "@/components/admin/CampaignApprovalQueue";

export const dynamic = "force-dynamic";

export default async function CampaignApprovalsPage() {
  const pending = await getPendingCampaigns();
  return (
    <div className="space-y-6 px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaign approvals</h1>
          <p className="mt-1 text-sm text-white/50">
            {pending.length} campaign brief{pending.length === 1 ? "" : "s"} awaiting approval.
          </p>
        </div>
      </div>
      <CampaignApprovalQueue initial={pending} />
    </div>
  );
}
