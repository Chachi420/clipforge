import Link from "next/link";
import Header from "@/components/Header";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui";
import { getCampaigns } from "@/lib/db";
import { profile } from "@/lib/mock";

export default async function DashboardHome() {
  const campaigns = await getCampaigns();
  const joined = campaigns.filter((c) => c.isJoined);
  const active = campaigns.filter((c) => !c.isJoined && c.status === "active").slice(0, 3);
  const past = campaigns.filter((c) => c.status === "paused").slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <Header title={`${greeting}, ${profile.displayName}`} subtitle="Manage your campaigns" />
      <div className="space-y-10 px-8 py-8">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Your active campaigns</h2>
            <Link href="/dashboard/campaigns">
              <Button variant="outline">Join a new campaign</Button>
            </Link>
          </div>
          {joined.length === 0 ? (
            <p className="text-sm text-white/45">You haven&apos;t joined any campaigns yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {joined.map((c) => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Recommended for you</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Your past campaigns</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {past.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      </div>
    </>
  );
}
