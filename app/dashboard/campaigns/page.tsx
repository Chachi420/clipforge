import CampaignsExplorer from "@/components/CampaignsExplorer";
import { getCampaigns } from "@/lib/db";

export default async function CampaignsRoute() {
  const campaigns = await getCampaigns();
  return <CampaignsExplorer initial={campaigns} />;
}
