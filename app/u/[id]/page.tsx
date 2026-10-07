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
    <div className="min-h-screen bg-base-950">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-3xl font-bold text-accent-soft">
                {profile.displayName.slice(0, 1)}
              </span>
            )}
            <div className="flex-1">
              <h1 className="flex items-center gap-2 text-2xl font-black text-white">
                {profile.displayName}
                <BadgeCheck size={20} className="text-accent-soft" />
              </h1>
              {profile.bio && <p className="mt-1 max-w-lg text-sm text-white/55">{profile.bio}</p>}
              <p className="mt-1 text-xs text-white/35">Clipper since {profile.joinedAt}</p>
            </div>
            <Link
              href="/login"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              Start clipping
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-black text-white">{formatCompact(clips.length)}</div>
              <div className="text-xs text-white/45">Clips</div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-black text-white">{formatCompact(totalViews)}</div>
              <div className="text-xs text-white/45">Total views</div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-black text-white">{verified.length}</div>
              <div className="text-xs text-white/45">Verified accounts</div>
            </div>
          </div>
        </Card>

        {verified.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 font-bold text-white">Verified accounts</h2>
            <div className="flex flex-wrap gap-2">
              {verified.map((a) => (
                <span key={a.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-base-850 px-4 py-2 text-sm text-white/75">
                  <PlatformDot platform={a.platform} />
                  <span className="font-mono">{a.handle}</span>
                  <Badge tone="green">Verified</Badge>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="mb-3 font-bold text-white">Recent clips</h2>
          {clips.length === 0 ? (
            <p className="text-sm text-white/40">No clips yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Clip</th>
                    <th className="px-4 py-3 text-right">Views</th>
                    <th className="px-4 py-3 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {clips.slice(0, 20).map((c) => (
                    <tr key={c.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-white/70">
                          <PlatformDot platform={c.platform} /> {PLATFORM_LABELS[c.platform]}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3">
                        <a href={c.postUrl} target="_blank" rel="noreferrer" className="text-accent-soft hover:underline">
                          {c.accountHandle || "View post"}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">{formatCompact(c.views)}</td>
                      <td className="px-4 py-3 text-right text-white/45">{c.submittedAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-white/30">
          ClipForge — clip, post, get paid. <Link href="/" className="underline">Learn more</Link>
        </p>
      </div>
    </div>
  );
}
