import Link from "next/link";
import Header from "@/components/Header";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui";
import { getCampaigns, getProfile, isLive } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { profile as mockProfile } from "@/lib/mock";

export default async function DashboardHome() {
  let userId: string | undefined;
  let name = mockProfile.displayName;
  if (isLive()) {
    const user = await getSessionUser();
    userId = user?.id;
    if (userId) {
      const p = await getProfile(userId);
      if (p) name = p.displayName;
    }
  }
  const campaigns = await getCampaigns(userId);
  const joined = campaigns.filter((c) => c.isJoined && c.status === "active");
  const active = campaigns.filter((c) => !c.isJoined && c.status === "active").slice(0, 3);
  const past = campaigns.filter((c) => c.status !== "active").slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <Header title={`${greeting}, ${name}`} subtitle="Manage your campaigns" />
      <div className="space-y-10 px-4 py-6 sm:px-8 sm:py-8">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-lg">Your active campaigns</h2>
            <Link href="/dashboard/campaigns">
              <Button variant="outline">Join a new campaign</Button>
            </Link>
          </div>
          {joined.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line/20 px-6 py-10 text-center">
              <p className="text-sm text-ink-soft">You haven&apos;t joined any campaigns yet.</p>
              <Link href="/dashboard/campaigns" className="mt-4 inline-block">
                <Button variant="electric">Browse campaigns</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {joined.map((c) => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}
        </section>

        <section>
          <h2 className="display mb-4 text-lg">Recommended for you</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="display mb-4 text-lg">Ended or paused</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {past.map((c) => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
