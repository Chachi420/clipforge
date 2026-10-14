import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, NightCard, Stat } from "@/components/ui";
import { getAdminOverview } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const o = await getAdminOverview();

  const queues = [
    { label: "Clips", desc: `${o.pendingClipReviews} awaiting review`, href: "/admin/clips" },
    { label: "Campaigns", desc: `${o.pendingCampaigns} briefs awaiting approval`, href: "/admin/campaigns" },
    { label: "Verifications", desc: `${o.pendingVerifications} accounts awaiting review`, href: "/admin/verifications" },
    { label: "Payouts", desc: `${o.pendingPayouts} awaiting review`, href: "/admin/payouts" },
    { label: "Clippers", desc: `${o.clippers} on the platform`, href: "/admin/clippers" },
    { label: "Brands", desc: `${o.brands} on the platform`, href: "/admin/brands" },
    { label: "Users", desc: "Roles and access", href: "/admin/users" },
    { label: "Billing", desc: "Record brand top-ups", href: "/admin/billing" },
  ];

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <NightCard className="p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="mt-1 text-sm text-white/50">
            Review queues and platform totals. Actions here affect real user data.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Stat
            dark
            label="Clips awaiting review"
            value={String(o.pendingClipReviews)}
            sub="Approve to start tracking"
          />
          <Stat
            dark
            label="Campaigns awaiting approval"
            value={String(o.pendingCampaigns)}
            sub={`${o.liveCampaigns} live now`}
          />
          <Stat
            dark
            label="Payouts awaiting review"
            value={String(o.pendingPayouts)}
            sub={`${formatMoney(o.pendingPayoutAmount)} total`}
          />
          <Stat
            dark
            label="Pending verifications"
            value={String(o.pendingVerifications)}
            sub="Accounts awaiting review"
          />
          <Stat dark label="Clippers" value={String(o.clippers)} sub="Registered clippers" />
          <Stat dark label="Brands" value={String(o.brands)} sub="On the platform" />
          <Stat dark label="Clips" value={String(o.clips)} sub="All statuses" />
          <Stat dark label="Total users" value={String(o.users)} sub="Registered profiles" />
        </div>
      </NightCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {queues.map((q) => (
          <Link key={q.label} href={q.href}>
            <Card className="group flex items-center justify-between p-5 transition-colors hover:border-ink/30">
              <div>
                <div className="font-semibold text-ink">{q.label}</div>
                <div className="mt-0.5 text-sm text-ink-faint">{q.desc}</div>
              </div>
              <ArrowUpRight
                size={18}
                className="shrink-0 text-ink-faint transition-colors group-hover:text-ink"
              />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
