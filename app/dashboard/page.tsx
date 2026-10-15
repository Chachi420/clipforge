import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import CampaignCard from "@/components/CampaignCard";
import OnboardingBanner from "@/components/OnboardingBanner";
import { Button, Card, EmptyState, Stat } from "@/components/ui";
import { getCampaigns, getProfile, getUserClips, getUserPayouts, getUserPaymentMethods, getUserSocialAccounts, isLive } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { profile as mockProfile } from "@/lib/mock";
import { formatCompact, formatMoney } from "@/lib/format";
import type { Clip, PaymentMethodRow, PayoutCycle, SocialAccount } from "@/lib/types";

function pluralize(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Whole days from today to a YYYY-MM-DD date string. Never negative. */
function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const end = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000));
}

export default async function DashboardHome() {
  let userId: string | undefined;
  let name = mockProfile.displayName;
  if (isLive()) {
    const user = await getSessionUser();
    userId = user?.id;
    if (userId) {
      const p = await getProfile(userId);
      // Admins land on the admin side (single authorized Google account).
      if (isAdminUser(user)) redirect("/admin");
      if (p) name = p.displayName;
    }
  }

  const campaigns = await getCampaigns(userId);
  const joinedActive = campaigns.filter((c) => c.isJoined && c.status === "active");
  const newCampaigns = campaigns.filter((c) => !c.isJoined && c.status === "active");

  let payouts: PayoutCycle[] = [];
  let clips: Clip[] = [];
  let accounts: SocialAccount[] = [];
  let methods: PaymentMethodRow[] = [];
  if (userId) {
    [payouts, clips, accounts, methods] = await Promise.all([
      getUserPayouts(userId),
      getUserClips(userId),
      getUserSocialAccounts(userId),
      getUserPaymentMethods(userId),
    ]);
  }

  const liveCycles = payouts.filter((p) => p.status === "live");
  const cycleEarnings = liveCycles.reduce((sum, p) => sum + p.estimatedAmount, 0);
  const verifiedViews = clips
    .filter((c) => c.trackingStatus === "tracking")
    .reduce((sum, c) => sum + c.views, 0);
  const nearestEnd = liveCycles.length > 0 ? liveCycles.map((p) => p.periodEnd).sort()[0] : null;
  const daysLeft = nearestEnd ? daysUntil(nearestEnd) : 0;

  const unverifiedAccounts = accounts.filter((a) => !a.verified);
  const hasVerifiedAccount = accounts.some((a) => a.verified);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const uploadHref =
    joinedActive.length > 0 ? `/dashboard/campaigns/${joinedActive[0].slug}` : "/dashboard/campaigns";

  const attention = [
    unverifiedAccounts.length > 0 && {
      tone: "warning" as const,
      text: `${pluralize(unverifiedAccounts.length, "social account needs", "social accounts need")} the bio code before your clips can count.`,
      href: "/dashboard/accounts",
    },
    methods.length === 0 && {
      tone: "error" as const,
      text: "You don't have a payout method yet. Add PayPal or a crypto wallet so we can pay you.",
      href: "/dashboard/payments",
    },
    newCampaigns.length > 0 && {
      tone: "default" as const,
      text: `${pluralize(newCampaigns.length, "active campaign you haven't joined", "active campaigns you haven't joined")}.`,
      href: "/dashboard/campaigns",
    },
  ].filter(Boolean) as { tone: "warning" | "error" | "default"; text: string; href: string }[];

  const toneDot: Record<string, string> = {
    warning: "bg-status-warning",
    error: "bg-status-error",
    default: "bg-ink",
  };

  return (
    <>
      <Header title={`${greeting}, ${name}`} subtitle={dateStr} />
      <div className="space-y-8 px-4 py-6 sm:px-8 sm:py-8">
        {(!hasVerifiedAccount || clips.length === 0) && (
          <OnboardingBanner
            hasConnectedAccount={accounts.length > 0}
            hasVerifiedAccount={hasVerifiedAccount}
            hasJoinedCampaign={joinedActive.length > 0}
            hasClips={clips.length > 0}
            uploadHref={uploadHref}
          />
        )}

        <section aria-labelledby="attention-heading">
          <h2 id="attention-heading" className="display mb-3 text-lg">
            Needs your attention
          </h2>
          {attention.length === 0 ? (
            <p className="text-sm text-ink-faint">All clear — nothing needs you right now.</p>
          ) : (
            <ul className="space-y-2">
              {attention.map((a) => (
                <li key={a.href + a.text}>
                  <Link
                    href={a.href}
                    className="flex items-center gap-3 rounded-card border border-line/10 bg-surface px-4 py-3 transition hover:bg-ink/5"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot[a.tone]}`} aria-hidden="true" />
                    <span className="text-sm text-ink">{a.text}</span>
                    <span className="ml-auto shrink-0 text-sm text-ink-faint" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="cycle-heading">
          <h2 id="cycle-heading" className="display mb-3 text-lg">
            This cycle
          </h2>
          {liveCycles.length === 0 ? (
            <EmptyState
              title="No live cycle yet"
              body="Join a campaign to start earning. Cycles run monthly and admins review every payout before money moves."
              action={
                <Link href="/dashboard/campaigns">
                  <Button variant="primary">Browse campaigns</Button>
                </Link>
              }
            />
          ) : (
            <Card className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Stat
                  label="Estimated earnings"
                  value={formatMoney(cycleEarnings)}
                  sub="This cycle · estimated, not final"
                />
                <Stat
                  label="Verified views"
                  value={formatCompact(verifiedViews)}
                  sub="On your clips"
                />
                <Stat
                  label="Cycle ends in"
                  value={pluralize(daysLeft, "day", "days")}
                  sub="Admins review before payout"
                />
              </div>
            </Card>
          )}
        </section>

        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="display mb-3 text-lg">
            Quick actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href={uploadHref}>
              <Button variant="primary">Upload clips</Button>
            </Link>
            <Link href="/dashboard/campaigns">
              <Button variant="outline">Browse campaigns</Button>
            </Link>
          </div>
        </section>

        <section aria-labelledby="snapshot-heading">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="snapshot-heading" className="display text-lg">
              Your active campaigns
            </h2>
            <Link href="/dashboard/campaigns" className="text-sm font-medium text-ink-soft hover:text-ink">
              View all campaigns →
            </Link>
          </div>
          {joinedActive.length === 0 ? (
            <EmptyState
              title="You're not in any campaigns yet"
              body="Pick a campaign that fits your audience, then post your first clip."
              action={
                <Link href="/dashboard/campaigns">
                  <Button variant="primary">Browse campaigns</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {joinedActive.slice(0, 3).map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
