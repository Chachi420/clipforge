import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { getAdminClipperDetail, setClipperStatus } from "@/lib/admin-actions";
import { formatMoney, formatCompact } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminClipperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getAdminClipperDetail(id);
  if (!c) notFound();

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <Link href="/admin/clippers" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to clippers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-3xl">{c.displayName}</h1>
          <p className="mt-1 text-sm text-ink-soft">{c.email} · joined {c.joinedAt}</p>
          {c.bio && <p className="mt-2 max-w-xl text-sm text-ink-soft">{c.bio}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={c.status === "suspended" ? "red" : "green"}>{c.status === "suspended" ? "Suspended" : "Active"}</Badge>
          <form
            action={async () => {
              "use server";
              await setClipperStatus(id, c.status === "suspended" ? "active" : "suspended");
            }}
          >
            <button
              type="submit"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                c.status === "suspended" ? "bg-ink text-paper" : "border border-status-error/30 text-status-error hover:bg-status-error/10"
              }`}
            >
              {c.status === "suspended" ? "Reactivate" : "Suspend"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-ink-faint">Total earned</p>
          <p className="mt-1 text-2xl font-bold text-ink">{formatMoney(c.totalEarned)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-ink-faint">Clips</p>
          <p className="mt-1 text-2xl font-bold text-ink">{c.clips.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-ink-faint">Verified accounts</p>
          <p className="mt-1 text-2xl font-bold text-ink">{c.accounts.filter((a) => a.verified).length}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <h2 className="px-5 pt-5 text-lg font-bold text-ink">Connected accounts</h2>
          <div className="divide-y divide-line/10 px-5 pb-5">
            {c.accounts.length === 0 && <p className="pt-3 text-sm text-ink-soft">No accounts connected.</p>}
            {c.accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-ink">
                  {a.platform} · {a.handle}
                </span>
                <span className="text-ink-soft">
                  {a.verified ? `Verified · ${formatCompact(a.followerCount)} followers` : "Unverified"}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <h2 className="px-5 pt-5 text-lg font-bold text-ink">Payouts</h2>
          <div className="divide-y divide-line/10 px-5 pb-5">
            {c.payouts.length === 0 && <p className="pt-3 text-sm text-ink-soft">No payouts yet.</p>}
            {c.payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-ink">{p.campaignName}</span>
                <span className="text-ink-soft">
                  {formatMoney(p.amount)} · {p.status} · {formatCompact(p.totalViews)} views
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <h2 className="px-5 pt-5 text-lg font-bold text-ink">Clips</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-line/10 text-[11px] uppercase tracking-wider text-ink-faint">
                <th className="px-5 py-3">Clip</th>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3 text-right">Views</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {c.clips.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-ink-soft">
                    No clips yet.
                  </td>
                </tr>
              )}
              {c.clips.map((clip) => (
                <tr key={clip.id}>
                  <td className="px-5 py-3">
                    <a href={clip.postUrl} target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-line hover:decoration-ink">
                      View clip ↗
                    </a>
                    <div className="text-xs text-ink-soft">
                      {clip.platform} {clip.handle ? `· ${clip.handle}` : ""}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{clip.campaignName}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">{formatCompact(clip.views)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={clip.status === "tracking" ? "green" : clip.status === "pending_review" ? "amber" : clip.status === "flagged" ? "red" : undefined}>
                      {clip.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{clip.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
