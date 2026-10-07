import Link from "next/link";
import { Card, Stat } from "@/components/ui";
import { getAdminOverview } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const o = await getAdminOverview();

  const cards = [
    {
      label: "Pending verifications",
      value: String(o.pendingVerifications),
      sub: "Accounts awaiting review",
      href: "/admin/verifications",
    },
    {
      label: "Payouts awaiting review",
      value: String(o.pendingPayouts),
      sub: `${formatMoney(o.pendingPayoutAmount)} total`,
      href: "/admin/payouts",
    },
    {
      label: "Campaigns",
      value: String(o.campaigns),
      sub: "All statuses",
      href: "/dashboard/campaigns",
    },
    {
      label: "Total users",
      value: String(o.users),
      sub: "Registered profiles",
      href: "/admin",
    },
  ];

  return (
    <div className="space-y-6 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-white/50">
          Review queues and platform totals. Actions here affect real user data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="p-5 transition hover:border-white/20">
              <Stat label={c.label} value={c.value} sub={c.sub} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
