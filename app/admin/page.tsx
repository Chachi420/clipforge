import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, NightCard, Stat } from "@/components/ui";
import { getAdminOverview } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const o = await getAdminOverview();

  const queues = [
    { label: "Verifications", desc: "Accounts awaiting review", href: "/admin/verifications" },
    { label: "Payouts", desc: "Review and mark paid", href: "/admin/payouts" },
    { label: "Campaigns", desc: "Approve brand briefs", href: "/admin/campaigns" },
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
            label="Pending verifications"
            value={String(o.pendingVerifications)}
            sub="Accounts awaiting review"
          />
          <Stat
            dark
            label="Payouts awaiting review"
            value={String(o.pendingPayouts)}
            sub={`${formatMoney(o.pendingPayoutAmount)} total`}
          />
          <Stat
            dark
            label="Campaigns"
            value={String(o.campaigns)}
            sub="All statuses"
          />
          <Stat
            dark
            label="Total users"
            value={String(o.users)}
            sub="Registered profiles"
          />
        </div>
      </NightCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {queues.map((q) => (
          <Link key={q.label} href={q.href}>
            <Card className="group flex items-center justify-between p-5 transition hover:border-electric-deep/40">
              <div>
                <div className="font-semibold text-ink">{q.label}</div>
                <div className="mt-0.5 text-sm text-ink-faint">{q.desc}</div>
              </div>
              <ArrowUpRight
                size={18}
                className="shrink-0 text-ink-faint transition group-hover:text-electric-deep"
              />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
