import { notFound } from "next/navigation";
import CampaignDetail from "@/components/CampaignDetail";
import { getBounties, getCampaign, getClips } from "@/lib/db";
import { payoutCycles } from "@/lib/mock";

export default async function CampaignRoute({ params }: { params: { slug: string } }) {
  const campaign = await getCampaign(params.slug);
  if (!campaign) notFound();
  const [bounties, clips] = await Promise.all([
    getBounties(campaign.id),
    getClips(campaign.id),
  ]);
  const cycles = payoutCycles.filter((c) => c.campaignId === campaign.id);
  return <CampaignDetail campaign={campaign} bounties={bounties} clips={clips} cycles={cycles} />;
}
