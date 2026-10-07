import { notFound } from "next/navigation";
import CampaignDetail from "@/components/CampaignDetail";
import { getBounties, getCampaign, getUserClips, getUserPayouts, isLive } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function CampaignRoute({ params }: { params: { slug: string } }) {
  let userId: string | undefined;
  if (isLive()) {
    const user = await getSessionUser();
    userId = user?.id;
  }
  const campaign = await getCampaign(params.slug, userId);
  if (!campaign) notFound();
  const [bounties, clips, payouts] = await Promise.all([
    getBounties(campaign.id),
    userId ? getUserClips(userId, campaign.id) : [],
    userId ? getUserPayouts(userId) : [],
  ]);
  const cycles = payouts.filter((p) => p.campaignId === campaign.id);
  return <CampaignDetail campaign={campaign} bounties={bounties} clips={clips} cycles={cycles} />;
}
