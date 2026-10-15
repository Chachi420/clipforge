import { getAuditLog } from "@/lib/admin-actions";
import { Badge, Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

const ACTION_TONE: Record<string, "green" | "amber" | "red" | undefined> = {
  "clip.approve": "green",
  "clip.bulk_approve": "green",
  "account.approve": "green",
  "campaign.approve": "green",
  "brand_request.approve": "green",
  "clipper.reactivate": "green",
  "brand.reactivate": "green",
  "payout.mark_paid": "green",
  "clip.reject": "red",
  "clip.bulk_reject": "red",
  "account.reject": "red",
  "campaign.reject": "red",
  "brand_request.reject": "red",
  "clip.flag": "amber",
  "clipper.suspend": "amber",
  "brand.suspend": "amber",
  "campaign.rate_change": "amber",
  "user.role_change": "amber",
  "topup.record": "amber",
};

export default async function AdminAuditPage() {
  const entries = await getAuditLog(100);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Activity log</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every admin decision — from this panel and from email links — newest first.
        </p>
      </div>
      {entries.length === 0 ? (
        <EmptyState title="No activity yet" body="Admin decisions will be recorded here." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">What happened</th>
                  <th className="px-4 py-3">Via</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {entries.map((e) => (
                  <tr key={e.id} className="transition hover:bg-ink/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{e.createdAt}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ACTION_TONE[e.action]}>{e.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink">{e.summary}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-faint">
                      {e.actor.includes("email link") ? "Email link" : "Admin panel"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
