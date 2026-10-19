import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { Badge, EmptyState, PlatformDot } from "@/components/ui";
import { getPublicClips, getPublicProfile, getUserSocialAccounts, getCampaigns } from "@/lib/db";
import { PLATFORM_LABELS } from "@/lib/types";
import { formatCompact } from "@/lib/format";

/**
 * Public clipper profile (brief §11). Contra-style: identity first, work
 * shown as a grid, stats second. All figures are real data from the
 * PII-safe public_profiles view — no emails, no invented numbers.
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const profile = await getPublicProfile(params.id).catch(() => null);
  if (!profile?.displayName) return { title: "Clipper — ClipForge" };
  return {
    title: `${profile.displayName} — Clipper on ClipForge`,
    description: `Clips and verified-view stats from ${profile.displayName}, a clipper on the ClipForge pay-per-view marketplace.`,
    alternates: { canonical: `/u/${params.id}` },
  };
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await getPublicProfile(params.id);
  if (!profile) notFound();
  const [clips, accounts, allCampaigns] = await Promise.all([
    getPublicClips(params.id),
    getUserSocialAccounts(params.id),
    getCampaigns(),
  ]);
  const verified = accounts.filter((a) => a.verified);
  const totalViews = clips.reduce((s, c) => s + c.views, 0);
  const campaignNames = new Map(allCampaigns.map((c) => [c.id, c.name]));
  const campaigns = [
    ...new Set(
      clips.map((c) => campaignNames.get(c.campaignId)).filter((n): n is string => Boolean(n))
    ),
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* Identity */}
        <header className="flex flex-col gap-6 py-12 md:flex-row md:items-center md:py-16">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-24 w-24 rounded-full border border-line/10 object-cover"
            />
          ) : (
            <span
              className="flex h-24 w-24 items-center justify-center rounded-full border border-line/10 bg-surface text-4xl font-bold text-ink"
              aria-hidden
            >
              {profile.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="flex-1">
            <p className="micro-label">Clipper</p>
            <h1 className="display mt-2 flex items-center gap-2 text-[clamp(2rem,6vw,3.5rem)] leading-none">
              {profile.displayName}
              <BadgeCheck size={28} className="shrink-0 text-ink" aria-label="Verified clipper" />
            </h1>
          </div>
          <Link
            href="/login"
            className="pill min-h-[44px] shrink-0 bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors duration-micro hover:bg-ink-soft"
          >
            Start clipping
          </Link>
        </header>

        {/* Stat row — real data only */}
        <dl className="grid grid-cols-3 gap-4 border-y border-line/10 py-8">
          {[
            { label: "Clips", value: formatCompact(clips.length) },
            { label: "Verified views", value: formatCompact(totalViews) },
            { label: "Verified accounts", value: String(verified.length) },
          ].map((s) => (
            <div key={s.label}>
              <dd className="display tnum text-2xl sm:text-3xl md:text-4xl">{s.value}</dd>
              <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>

        {/* Work — clip grid linking out */}
        <section aria-labelledby="profile-clips" className="mt-14">
          <h2 id="profile-clips" className="display text-2xl">
            Clips
          </h2>
          {clips.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No public clips yet"
                body={`${profile.displayName} hasn't posted any public clips. Check back soon — or start clipping yourself.`}
                action={
                  <Link
                    href="/login"
                    className="pill min-h-[44px] bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors duration-micro hover:bg-ink-soft"
                  >
                    Start clipping
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clips.slice(0, 24).map((c) => (
                <a
                  key={c.id}
                  href={c.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-card border border-line/10 bg-surface p-5 transition-colors duration-micro hover:border-ink/30"
                >
                  <div className="flex items-center gap-2 text-sm text-ink-soft">
                    <PlatformDot platform={c.platform} />
                    <span className="font-mono text-[13px]">{c.accountHandle || PLATFORM_LABELS[c.platform]}</span>
                  </div>
                  <div className="display tnum mt-4 text-3xl">{formatCompact(c.views)}</div>
                  <div className="text-xs text-ink-faint">verified views</div>
                  {c.campaignId && campaignNames.get(c.campaignId) && (
                    <div className="mt-3">
                      <Badge>{campaignNames.get(c.campaignId)}</Badge>
                    </div>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                    View post <ArrowUpRight size={15} aria-hidden />
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Verified accounts */}
        {verified.length > 0 && (
          <section aria-labelledby="profile-accounts" className="mt-14">
            <h2 id="profile-accounts" className="display text-2xl">
              Verified accounts
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {verified.map((a) => (
                <li
                  key={a.id}
                  className="flex min-h-[44px] items-center gap-2 rounded-full border border-line/10 bg-surface px-4 py-2 text-sm text-ink-soft"
                >
                  <PlatformDot platform={a.platform} />
                  <span className="font-mono text-[13px]">{a.handle}</span>
                  <Badge tone="success">Verified</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <section aria-labelledby="profile-campaigns" className="mt-14">
            <h2 id="profile-campaigns" className="display text-2xl">
              Campaigns
            </h2>
            <ul className="mt-6 space-y-0 border-t border-line/10">
              {campaigns.map((name) => (
                <li
                  key={name}
                  className="border-b border-line/10 py-4 text-[15px] font-medium text-ink"
                >
                  {name}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
