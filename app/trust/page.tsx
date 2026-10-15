import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, UserCheck, Wallet, Zap } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { Card } from "@/components/ui";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Trust & Safety — ClipForge",
  description:
    "How ClipForge keeps views honest and money safe: verified accounts, official view sources, admin clip review, fraud detection, and monthly payout cycles.",
  alternates: { canonical: "/trust" },
};

/**
 * All claims below reflect real platform behavior:
 * - MIN_FOLLOWERS = 1000 — lib/youtube.ts
 * - Bio-code verification; YouTube live via YouTube Data API; TikTok/IG/X manual review — lib/actions.ts
 * - Clips held in pending_review until admin approves — lib/actions.ts (uploadClips)
 * - View sources: YouTube Data API (lib/youtube.ts), Instagram via Apify (lib/apify.ts)
 * - Spike detection in the scan route — app/api/cron/scan-clips/route.ts
 * - Monthly payout cycles, $10 minimum, carryover — lib/payout-math.ts (MIN_PAYOUT_USD)
 */

const PILLARS = [
  {
    icon: UserCheck,
    title: "Verified accounts only",
    body: "Clippers post only from accounts they've proven they own — a unique code in the bio, checked by our bot. Every account needs at least 1,000 followers. No verified account, no earnings. Throwaway accounts can't get in.",
  },
  {
    icon: Eye,
    title: "Views from official sources",
    body: "YouTube views come from the YouTube Data API. Instagram views come through our tracking integration. Nobody self-reports numbers, and nobody types view counts into a form — the platform reads them directly.",
  },
  {
    icon: ShieldCheck,
    title: "Every clip passes human review",
    body: "Before a single view counts, an admin confirms the clip is from a verified account and fits the campaign. Uploads sit in pending review until approved. Rejected clips come back with a reason.",
  },
  {
    icon: Zap,
    title: "Spike detection",
    body: "View snapshots are recorded over time, and sudden spikes that don't match real viewing patterns get flagged for manual review before they count toward anyone's earnings or a brand's spend.",
  },
  {
    icon: Wallet,
    title: "Money moves on a schedule",
    body: "Earnings settle in monthly payout cycles, and payouts only go out once a balance clears $10. Smaller balances carry forward — they never vanish. Brands prepay and cap every campaign, so spend can never run past the budget.",
  },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav
        ctaHref="/brand/request"
        ctaLabel="Start a campaign"
        signInHref="/login"
        signInLabel="Sign in"
      />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-12 text-center md:py-20">
          <Reveal as="p" className="micro-label">
            Trust &amp; Safety
          </Reveal>
          <Reveal as="h1" className="display mt-4 text-4xl md:text-6xl">
            Honest views.
            <br />
            Honest money.
          </Reveal>
          <Reveal as="p" className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            A pay-per-view marketplace only works if the views are real. Here&apos;s
            exactly what stands between fake engagement and your money.
          </Reveal>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-6xl px-6 pb-12 md:pb-20">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={Math.min(i * 0.06, 0.24)} className="h-full">
                <Card className="h-full p-6 md:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15">
                    <p.icon size={20} strokeWidth={1.8} />
                  </span>
                  <h2 className="mt-5 text-lg font-bold">{p.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.body}</p>
                </Card>
              </Reveal>
            ))}

            {/* CTA card fills the 6th slot */}
            <Reveal delay={0.24} className="h-full">
              <Card className="flex h-full flex-col justify-between bg-ink p-6 text-paper md:p-7">
                <div>
                  <h2 className="text-lg font-bold">See it in the open</h2>
                  <p className="mt-3 text-sm leading-relaxed text-paper/70">
                    Our pricing, FAQ, and policies are all public. If something
                    looks off, the Grievance Officer page tells you exactly how
                    to raise it.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/pricing"
                    className="pill inline-flex min-h-[44px] items-center gap-2 bg-paper px-5 text-sm font-semibold text-ink"
                  >
                    Pricing <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/faq"
                    className="pill inline-flex min-h-[44px] items-center border border-paper/25 px-5 text-sm font-semibold text-paper"
                  >
                    FAQ
                  </Link>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* Enforcement note */}
        <section className="border-t border-ink/10">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <Reveal as="h2" className="display text-2xl md:text-3xl">
              What happens when someone cheats
            </Reveal>
            <Reveal as="p" className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
              Viewbots, engagement pods, bought views — flagged clips go to manual
              review, and confirmed fraud means suspension: no uploads, no earnings.
              If you believe a flag was wrong, you can appeal through our{" "}
              <Link href="/policies/grievance-officer" className="font-semibold text-ink underline underline-offset-4">
                Grievance Officer
              </Link>
              , with a decision back within 30 days.
            </Reveal>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
