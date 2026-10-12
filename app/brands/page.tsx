import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Check, Gauge, HandCoins, Users } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { Faq, MarketingFooter } from "@/components/marketing";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "ClipForge for Brands — Pay Per Verified View",
  description:
    "Run clipping campaigns and pay only for verified views. Set your rate, cap your budget, and track every clip on a live dashboard.",
  alternates: { canonical: "/brands" },
};

const STEPS = [
  {
    n: "01",
    title: "Brief",
    body: "Tell us the goal, the content you want clipped, your budget, and the per-view rate you're comfortable with.",
  },
  {
    n: "02",
    title: "Managed",
    body: "Clippers post across TikTok, Reels, Shorts, and X. Viewbot detection plus manual review keeps the numbers honest.",
  },
  {
    n: "03",
    title: "Track",
    body: "A live dashboard shows verified views, spend versus your hard cap, and which clips are driving reach.",
  },
];

const WHY = [
  {
    icon: HandCoins,
    title: "Pay per verified view",
    body: "You pay for reach that actually happened — not per post, not per follower, not per promise.",
  },
  {
    icon: Gauge,
    title: "Budget hard caps",
    body: "Set the budget up front. The campaign stops at your cap, so you never overspend.",
  },
  {
    icon: Users,
    title: "Rates that attract talent",
    body: "You propose the per-view rate, and above-market rates pull in the clippers who can actually move the needle.",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    body: "Watch verified views and spend in real time, clip by clip, instead of waiting for a post-campaign report.",
  },
];

/* Honest comparison — describes typical sponsored-post buying as it
   actually works, against ClipForge's documented mechanics. No strawmen. */
const OLD_WAY = [
  { title: "Pay a flat fee per post", body: "The price is locked before anyone knows the reach." },
  { title: "Reach is a hope", body: "You find out what a post did after it goes live." },
  { title: "Reports come later", body: "A recap deck after the campaign ends." },
  { title: "Budgets are lump sums", body: "Negotiated up front, spent whether it works or not." },
];

const CLIPFORGE_WAY = [
  { title: "Pay per verified view", body: "The rate is set by you, published before anyone posts." },
  { title: "Reach is the product", body: "You only pay for views that actually happened." },
  { title: "Live dashboard", body: "Every clip, its views, and your spend — right now." },
  { title: "Hard budget cap", body: "Set it once. The campaign stops at your cap." },
];

const FAQ_ITEMS = [
  { q: "How much does it cost?", a: "You set the budget and the per-view rate — priced per 100K verified views — with a hard cap. There is no fixed pricing: you spend exactly what you approve, and the campaign never goes over your cap." },
  { q: "Do I need to manage anything?", a: "No — campaigns are managed. You submit a brief, we run it with the clipper community, and you watch results on a live dashboard. You can check in any time, but there is nothing you have to operate." },
  { q: "How are views verified?", a: "View counts come straight from the platforms, are filtered through viewbot detection, and are spot-checked by manual review. You only pay for views that survive all three layers." },
];

const TRUST_ROW = ["Pay per verified view", "Hard budget caps", "Cancel anytime"];

export default function BrandsLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav
        ctaHref="/brand/request"
        ctaLabel="Start a campaign"
        signInHref="/brand/login"
        signInLabel="Brand sign in"
      />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
          <Reveal as="p" className="micro-label">
            For brands
          </Reveal>
          <Reveal as="h1" delay={80} className="display mx-auto mt-6 max-w-4xl text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95]">
            Turn your content into a wall of clips.
          </Reveal>
          <Reveal as="p" delay={160} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Tell us the goal. We run the campaign. You pay only for verified views.
          </Reveal>
          <Reveal delay={240} className="mt-10">
            <Link
              href="/brand/request"
              className="group pill min-h-[52px] bg-ink px-9 py-4 text-base font-semibold text-paper transition-colors duration-micro hover:bg-ink-soft"
            >
              Start a campaign{" "}
              <ArrowRight
                size={18}
                aria-hidden
                className="transition-transform duration-micro group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
          <Reveal delay={300} as="ul" className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_ROW.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-ink-faint">
                <Check size={16} className="text-ink" aria-hidden /> {t}
              </li>
            ))}
          </Reveal>
        </section>

        {/* Steps — editorial rows */}
        <section aria-labelledby="brand-steps" className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <Reveal as="p" className="micro-label">
            How it works
          </Reveal>
          <Reveal as="h2" delay={80} id="brand-steps" className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">
            You brief. We run it. You track.
          </Reveal>
          <div className="mt-10 border-t border-line/10">
            {STEPS.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 70}
                className="grid gap-4 border-b border-line/10 py-7 md:grid-cols-[80px_1fr] md:gap-10 md:py-9"
              >
                <span className="display text-4xl text-ink-faint md:text-5xl" aria-hidden>
                  {s.n}
                </span>
                <div className="max-w-2xl">
                  <h3 className="display text-2xl">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Why — editorial list */}
        <section aria-labelledby="brand-why" className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <Reveal as="p" className="micro-label">
            Why ClipForge
          </Reveal>
          <Reveal as="h2" delay={80} id="brand-why" className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">
            Reach you can audit.
          </Reveal>
          <div className="mt-8 border-t border-line/10">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 60} className="flex gap-5 border-b border-line/10 py-6">
                <w.icon size={24} className="mt-1 shrink-0 text-ink" aria-hidden />
                <div>
                  <h3 className="display text-xl">{w.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                    {w.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Old way vs ClipForge — one honest comparison */}
        <section aria-labelledby="brand-compare" className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <Reveal as="p" className="micro-label">
            Why switch
          </Reveal>
          <Reveal as="h2" delay={80} id="brand-compare" className="display mt-4 max-w-2xl text-[clamp(2rem,5vw,3.5rem)]">
            Stop buying posts. Start buying views.
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Reveal delay={120} className="rounded-card border border-line/10 p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                The old way
              </p>
              <ul className="mt-6 space-y-6">
                {OLD_WAY.map((r) => (
                  <li key={r.title}>
                    <p className="font-semibold text-ink-soft">{r.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-faint">{r.body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={200} className="rounded-card border border-ink bg-surface p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                ClipForge
              </p>
              <ul className="mt-6 space-y-6">
                {CLIPFORGE_WAY.map((r) => (
                  <li key={r.title} className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-ink" aria-hidden />
                    <div>
                      <p className="font-semibold text-ink">{r.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="brand-faq" className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <Reveal as="h2" id="brand-faq" className="display text-center text-[clamp(2rem,5vw,3.5rem)]">
            Questions, answered
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </section>

        {/* Final CTA — black */}
        <section className="bg-black py-20 text-center text-white md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal as="h2" className="display mx-auto max-w-3xl text-[clamp(2.5rem,7vw,5rem)] leading-[1.0] text-white">
              Buy reach, not promises.
            </Reveal>
            <Reveal as="p" delay={100} className="mx-auto mt-6 max-w-xl leading-relaxed text-white/60">
              Brief your campaign in minutes, watch verified views roll in on a
              live dashboard, and never spend more than your cap.
            </Reveal>
            <Reveal delay={180} className="mt-10">
              <Link
                href="/brand/request"
                className="group pill min-h-[52px] bg-white px-9 py-4 text-base font-semibold text-black transition-colors duration-micro hover:bg-white/85"
              >
                Start a campaign{" "}
                <ArrowRight
                  size={18}
                  aria-hidden
                  className="transition-transform duration-micro group-hover:translate-x-0.5"
                />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
