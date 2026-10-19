import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coins, Percent, Wallet } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { Card, Stat } from "@/components/ui";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Pricing — Wondeed",
  description:
    "How Wondeed pricing works: brands fund campaigns, clippers earn per verified view, and the platform take is agreed per campaign. No subscriptions, no hidden fees.",
  alternates: { canonical: "/pricing" },
};

/**
 * Real numbers, all from the codebase:
 * - MIN_PAYOUT_USD = 10 — lib/payout-math.ts
 * - Payout cycles are monthly (calendar-month periods) — app/api/cron/close-payout-cycle/route.ts
 * - Brand budget ranges: under_1k / 1k_5k / 5k_25k / 25k_plus USD — lib/brand-actions.ts
 * - Platform take: negotiated per campaign (campaigns.platform_take_rate), 20% default
 */

const FLOW = [
  {
    icon: Wallet,
    step: "01",
    title: "Brands fund a campaign",
    body: "A brand sets a budget cap and a per-view rate, then tops up their balance before anything goes live. Spend can never exceed the cap — when the budget runs out, the campaign pauses automatically. Unused budget is refunded when the campaign ends.",
  },
  {
    icon: Percent,
    step: "02",
    title: "Wondeed takes a standard cut",
    body: `The platform take is agreed per campaign — the standard rate is 20% of campaign spend. That's the whole business model — no subscriptions, no seat fees, no setup costs for anyone.`,
  },
  {
    icon: Coins,
    step: "03",
    title: "Clippers earn per verified view",
    body: "Clippers post clips from their verified accounts and earn based on verified views. Earnings settle in monthly payout cycles, and anything under the $10 payout minimum carries forward to the next month — it never disappears.",
  },
];

const RATE_CARD = [
  { label: "Platform take", value: "20%", sub: "standard rate, agreed per campaign" },
  { label: "Brand signup", value: "$0", sub: "no setup, no subscription" },
  { label: "Clipper signup", value: "$0", sub: "free forever" },
  { label: "Payout minimum", value: "$10", sub: "sub-minimum balances carry forward" },
  { label: "Payout schedule", value: "Monthly", sub: "calendar-month cycles" },
  { label: "Campaign budgets", value: "Under $1K – $25K+", sub: "brands pick a range that fits" },
];

export default function PricingPage() {
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
            Pricing
          </Reveal>
          <Reveal as="h1" className="display mt-4 text-4xl md:text-6xl">
            Money only moves
            <br />
            when views do.
          </Reveal>
          <Reveal as="p" className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Brands pay for verified views. Clippers earn for producing them. Wondeed
            keeps a standard cut for running the marketplace. That&apos;s the entire
            pricing model.
          </Reveal>
        </section>

        {/* Money flow */}
        <section className="mx-auto max-w-6xl px-6 pb-12 md:pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {FLOW.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08} className="h-full">
                <Card className="h-full p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15">
                      <s.icon size={20} strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-xs text-ink-faint">{s.step}</span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold">{s.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Rate card */}
        <section className="border-t border-ink/10">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
            <Reveal as="h2" className="display text-3xl md:text-4xl">
              The rate card
            </Reveal>
            <Reveal as="p" className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
              Every number that touches your money, in one place. If a number
              isn&apos;t listed here, we don&apos;t charge it.
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {RATE_CARD.map((r, i) => (
                <Reveal key={r.label} delay={Math.min(i * 0.05, 0.2)} className="h-full">
                  <Card className="h-full p-5 md:p-6">
                    <Stat label={r.label} value={r.value} sub={r.sub} />
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Brand budget note */}
        <section className="border-t border-ink/10">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <Reveal as="h2" className="display text-3xl md:text-4xl">
                  For brands: pick a budget range
                </Reveal>
                <Reveal as="p" className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
                  When you request brand access, you tell us roughly what you plan to
                  spend — under $1K, $1K–$5K, $5K–$25K, or $25K and up. Your actual
                  spend is capped per campaign, and you top up your balance before
                  anything runs. Prepay only, no invoices chasing you later.
                </Reveal>
              </div>
              <div>
                <Reveal as="h2" className="display text-3xl md:text-4xl">
                  For clippers: free to earn
                </Reveal>
                <Reveal as="p" className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
                  No fees to join, no fees to post. Connect your accounts, get
                  verified, submit clips to live campaigns. Your earnings accumulate
                  through the month and pay out once they clear $10 — smaller
                  balances roll into the next month automatically.
                </Reveal>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/brand/login" className="pill btn-liquid inline-flex min-h-[48px] items-center gap-2 bg-ink px-7 text-sm font-semibold text-paper">
                Start a campaign <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="pill inline-flex min-h-[48px] items-center bg-ink px-7 text-sm font-semibold text-paper">
                Start clipping
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
