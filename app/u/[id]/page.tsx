import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Badge, Card, PlatformDot } from "@/components/ui";
import { getPublicClips, getPublicProfile, getUserSocialAccounts } from "@/lib/db";
import { PLATFORM_LABELS } from "@/lib/types";
import { formatCompact } from "@/lib/format";

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await getPublicProfile(params.id);
  if (!profile) notFound();
  const [clips, accounts] = await Promise.all([
    getPublicClips(params.id),
    getUserSocialAccounts(params.id),
  ]);
  const verified = accounts.filter((a) => a.verified);
  const totalViews = clips.reduce((s, c) => s + c.views, 0);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime/25 text-3xl font-bold text-lime-deep">
                {profile.displayName.slice(0, 1)}
              </span>
            )}
            <div className="flex-1">
              <h1 className="display flex items-center gap-2 text-2xl">
                {profile.displayName}
                <BadgeCheck size={20} className="text-lime-deep" />
              </h1>
              {profile.bio && <p className="mt-1 max-w-lg text-sm text-ink-soft">{profile.bio}</p>}
              <p className="mt-1 text-xs text-ink-faint">Clipper since {profile.joinedAt}</p>
            </div>
            <Link
              href="/login"
              className="rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-lime-soft"
            >
              Start clipping
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-line/10 p-4 text-center">
              <div className="display text-2xl">{formatCompact(clips.length)}</div>
              <div className="text-xs text-ink-faint">Clips</div>
            </div>
            <div className="rounded-2xl border border-line/10 p-4 text-center">
              <div className="display text-2xl">{formatCompact(totalViews)}</div>
              <div className="text-xs text-ink-faint">Total views</div>
            </div>
            <div className="rounded-2xl border border-line/10 p-4 text-center">
              <div className="display text-2xl">{verified.length}</div>
              <div className="text-xs text-ink-faint">Verified accounts</div>
            </div>
          </div>
        </Card>

        {verified.length > 0 && (
          <div className="mt-6">
            <h2 className="display mb-3">Verified accounts</h2>
            <div className="flex flex-wrap gap-2">
              {verified.map((a) => (
                <span key={a.id} className="flex items-center gap-2 rounded-full border border-line/10 bg-surface/70 px-4 py-2 text-sm text-ink-soft">
                  <PlatformDot platform={a.platform} />
                  <span className="font-mono">{a.handle}</span>
                  <Badge tone="green">Verified</Badge>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="display mb-3">Recent clips</h2>
          {clips.length === 0 ? (
            <p className="text-sm text-ink-faint">No clips yet.</p>
          ) : (
            <div className="glass overflow-x-auto rounded-3xl">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-[11px] uppercase tracking-wider text-ink-faint">
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Clip</th>
                    <th className="px-4 py-3 text-right">Views</th>
                    <th className="px-4 py-3 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {clips.slice(0, 20).map((c) => (
                    <tr key={c.id} className="border-b border-line/10 last:border-0">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-ink-soft">
                          <PlatformDot platform={c.platform} /> {PLATFORM_LABELS[c.platform]}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3">
                        <a href={c.postUrl} target="_blank" rel="noreferrer" className="text-lime-deep hover:underline">
                          {c.accountHandle || "View post"}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">{formatCompact(c.views)}</td>
                      <td className="px-4 py-3 text-right text-ink-faint">{c.submittedAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-ink-faint">
          ClipForge — clip, post, get paid. <Link href="/" className="underline">Learn more</Link>
        </p>
      </div>
    </div>
  );
}
