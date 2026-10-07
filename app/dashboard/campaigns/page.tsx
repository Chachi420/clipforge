import CampaignsExplorer from "@/components/CampaignsExplorer";
import { getCampaigns } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function CampaignsRoute() {
  const user = await getSessionUser().catch(() => null);
  const campaigns = await getCampaigns(user?.id);
  return <CampaignsExplorer initial={campaigns} />;
}
