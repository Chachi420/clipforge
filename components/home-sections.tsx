import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Faq } from "@/components/marketing";
import { CountUp, Reveal } from "@/components/motion";
import { MoneyFlowDiagram } from "@/components/infographics";
import { EarningsCalculator } from "@/app/clip/calculator";
import { ClipWall } from "@/components/showcase";
import ClipShowcase from "@/components/ClipShowcase";
import type { ShowcaseClip } from "@/lib/showcase";

/* ------------------------------------------------------------------ */
/* Hero (brief §10.2) — white. Kicker, massive H1, one-line subline,    */
/* dual CTAs (clippers + brands), typographic money-equation lockup    */
/* labeled Illustrative. Staggered entrance via Reveal (above the fold  */
/* = plays on mount).                                                  */
/* ------------------------------------------------------------------ */
export function HomeHero({ clips = [] }: { clips?: ShowcaseClip[] }) {
  // Above the fold: CSS-only entrance (.rise) so the hero paints immediately
  // instead of waiting for JS + IntersectionObserver (it used to load blank).
  return (
    <header className="relative isolate overflow-hidden">
      <ClipWall clips={clips} />
      <div className="relative mx-auto flex min-h-[72svh] max-w-site flex-col items-center justify-center px-6 py-14 text-center md:min-h-[84svh] md:py-20 lg:px-10">
        <p className="micro-label rise">Pay-per-view clipping marketplace</p>
        <h1
          className="display rise mt-6 max-w-5xl text-[clamp(3rem,10vw,7.5rem)] leading-[0.95]"
          style={{ animationDelay: "80ms" }}
        >
          Get paid for every view your clips earn.
        </h1>
        <p
          className="rise mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
          style={{ animationDelay: "160ms" }}
        >
          Brands post campaigns with a per-view rate. You clip, post, and earn per
          verified view — monthly payouts via PayPal or crypto.
        </p>
        <div
          className="rise mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          style={{ animationDelay: "240ms" }}
        >
          <Link href="/login" className="group glass-btn-primary min-h-[56px] px-9 py-4 text-base">
            Start clipping
            <ArrowRight
              size={18}
              aria-hidden
              className="transition-transform duration-micro group-hover:translate-x-0.5"
            />
          </Link>
          <Link href="/brand/login" className="glass-btn min-h-[56px] px-9 py-4 text-base">
            Run a campaign
          </Link>
        </div>

        {/* Money equation lockup — on glass, over the clip wall */}
        <div className="rise mt-12 w-full max-w-3xl" style={{ animationDelay: "320ms" }}>
          <div className="glass flex flex-col items-stretch justify-center gap-3 rounded-card px-6 py-6 sm:flex-row sm:items-center sm:gap-6">
            <span className="display text-2xl sm:text-3xl">100K verified views</span>
            <span className="display text-2xl text-ink-faint" aria-hidden>×</span>
            <span className="display text-2xl sm:text-3xl">brand&apos;s rate</span>
            <span className="display text-2xl text-ink-faint" aria-hidden>=</span>
            <span className="display text-2xl sm:text-3xl">your payout</span>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Illustrative — each campaign sets its own rate.
          </p>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Clips earning right now — real approved clips, playable inline.     */
/* Hidden until there are enough real clips to be worth showing.       */
/* ------------------------------------------------------------------ */
export function HomeClipShowcase({ clips }: { clips: ShowcaseClip[] }) {
  if (clips.length < 4) return null;
  return (
    <section aria-labelledby="clips-now" className="mx-auto max-w-site px-6 lg:px-10 py-12 md:py-20 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Reveal as="p" className="micro-label">
            On the platform
          </Reveal>
          <Reveal as="h2" delay={80} id="clips-now" className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">
            Clips earning right now.
          </Reveal>
          <Reveal as="p" delay={140} className="mt-3 max-w-xl leading-relaxed text-ink-soft">
            Real clips on live campaigns, ranked by tracked views. Tap one to watch it.
          </Reveal>
        </div>
        <Reveal delay={200}>
          <Link href="/login" className="group glass-btn min-h-[48px] px-6 py-3 text-sm">
            Browse campaigns
            <ArrowRight size={16} aria-hidden className="transition-transform duration-micro group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
      <div className="mt-8">
        <ClipShowcase clips={clips} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works (brief §10.3) — asymmetric editorial rows, NOT cards.  */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    n: "01",
    title: "Pick a campaign",
    body: "Browse live briefs. Every campaign shows its rate per 100K views up front — you know the math before you post.",
  },
  {
    n: "02",
    title: "Post clips",
    body: "Cut clips from the campaign's content, post them on your TikTok, Reels, Shorts, or X, and paste the links in.",
  },
  {
    n: "03",
    title: "Get paid monthly",
    body: "We count verified views as they land. When the monthly cycle closes, admins review and your payout goes out.",
  },
];

export function HomeHowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="mx-auto max-w-site px-6 lg:px-10 py-10 md:py-20">
      <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <div className="md:sticky md:top-24 md:self-start">
          <Reveal as="p" className="micro-label">
            How it works
          </Reveal>
          <Reveal as="h2" delay={80} id="how-it-works" className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">
            Three steps. No pitch decks.
          </Reveal>
        </div>
        <div>
          {STEPS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 80}
              className={`border-t border-line/10 py-6 md:py-8 ${
                i === STEPS.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-8">
                <span className="display text-5xl text-ink-faint" aria-hidden>
                  {s.n}
                </span>
                <div className="max-w-xl">
                  <h3 className="display text-2xl">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Money math (brief §10.4) — BLACK full-bleed. The entire model in    */
/* one equation, then the money-flow diagram showing the mechanism.    */
/* ------------------------------------------------------------------ */
export function HomeMoneyMath() {
  return (
    <section aria-labelledby="money-math" className="on-dark bg-black py-12 text-white md:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-10">
        <Reveal as="p" className="text-xs sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
          The business model
        </Reveal>
        <Reveal delay={80}>
          <p
            id="money-math"
            className="display mt-8 text-[clamp(2.25rem,8vw,5.5rem)] leading-[1.05] text-white"
          >
            100K verified views × $40/100K ={" "}
            <CountUp value={40} format="usd" />
          </p>
        </Reveal>
        <Reveal as="p" delay={160} className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
          That&apos;s the entire business model.
        </Reveal>
        <Reveal as="p" delay={200} className="mt-4 text-xs text-white/40">
          Illustrative example — each campaign sets its own rate.
        </Reveal>

        <MoneyFlowDiagram />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Two paths (brief §10.5) — split section, content not a quiz.        */
/* ------------------------------------------------------------------ */
const CLIPPER_BULLETS = [
  "No following required — views pay, not followers",
  "Automatic view tracking, straight from the platforms",
  "Monthly payouts via PayPal or crypto",
];

const BRAND_BULLETS = [
  "Pay only for verified views that actually happened",
  "Hard budget caps — never spend more than you approve",
  "A live dashboard showing every clip and its reach",
];

function PathPanel({
  kicker,
  title,
  body,
  bullets,
  ctaLabel,
  ctaHref,
}: {
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col rounded-card border border-line/10 bg-surface p-8 md:p-10">
      <p className="micro-label">{kicker}</p>
      <h3 className="display mt-4 text-3xl">{title}</h3>
      <p className="mt-3 leading-relaxed text-ink-soft">{body}</p>
      <ul className="mt-6 space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[15px] text-ink-soft">
            <Check size={18} className="mt-0.5 shrink-0 text-ink" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link
          href={ctaHref}
          className="group glass-btn-primary min-h-[48px] px-6 py-3 text-sm"
        >
          {ctaLabel}{" "}
          <ArrowRight
            size={16}
            aria-hidden
            className="transition-transform duration-micro group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}

export function HomeTwoPaths() {
  return (
    <section aria-labelledby="two-paths" className="mx-auto max-w-site px-6 lg:px-10 py-10 md:py-20">
      <Reveal as="p" className="micro-label">
        Two ways in
      </Reveal>
      <Reveal as="h2" delay={80} id="two-paths" className="display mt-4 max-w-2xl text-[clamp(2rem,5vw,3.5rem)]">
        Clippers earn. Brands pay for views.
      </Reveal>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Reveal delay={120}>
          <PathPanel
            kicker="For clippers"
            title="Already posting clips? Get paid for it."
            body="Pick a brief, post to your own accounts, and watch verified views turn into money."
            bullets={CLIPPER_BULLETS}
            ctaLabel="Start clipping"
            ctaHref="/login"
          />
        </Reveal>
        <Reveal delay={200}>
          <PathPanel
            kicker="For brands"
            title="Stop paying for posts. Pay for views."
            body="Set a rate, cap the budget, and pay only for verified reach. If nobody watches, you pay nothing."
            bullets={BRAND_BULLETS}
            ctaLabel="Start a campaign"
            ctaHref="/brand/request"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ (brief §10.7) — keep the good human-voiced Q&A.                 */
/* ------------------------------------------------------------------ */
const FAQ_ITEMS = [
  {
    q: "I have 200 followers. Can I actually earn?",
    a: "Yes — that's the whole point. You get paid per view, not per follower. A sharp clip from a small account routinely outperforms a lazy one from a big account. The view counter doesn't care about your follower count.",
  },
  {
    q: "How do I know the view counts are real?",
    a: "We pull numbers directly from the platform APIs, strip out bot traffic, and humans spot-check the rest. Brands see the same dashboard you do — if a view didn't happen, nobody pays for it and nobody earns from it.",
  },
  {
    q: "When do I actually get paid?",
    a: "Campaigns run in monthly cycles. When a cycle closes, your verified views convert to earnings at the campaign's published rate, sent to your PayPal or crypto wallet. No minimum threshold games, no 90-day holds.",
  },
  {
    q: "How are views verified?",
    a: "View counts are pulled directly from the platforms, filtered through viewbot detection, and spot-checked by manual review. Only verified views count toward earnings and brand billing.",
  },
  {
    q: "What does it cost brands?",
    a: "Brands set their own budget and per-view rate — priced per 100K verified views — with a hard cap. There is no fixed pricing: you spend exactly what you approve, nothing more.",
  },
  {
    q: "How do my social accounts get verified?",
    a: "When you add an account, we give you a unique code to put in that account's bio. Our system checks the bio for the code before it goes Active. Only clips from your Active accounts earn.",
  },
  {
    q: "Which platforms can I post clips to?",
    a: "TikTok, Instagram Reels, YouTube Shorts, and X. Every clip link you submit has to come from one of your verified accounts — a link from anywhere else gets rejected.",
  },
  {
    q: "Can I join more than one campaign at a time?",
    a: "Yes. Browse as many live briefs as you want — each clip you submit is tied to one campaign, and its views accrue at that campaign's rate.",
  },
  {
    q: "What happens when a campaign's budget runs out?",
    a: "Every campaign has a hard budget cap, so it stops taking new views once the budget is allocated. Views are logged as they happen, so everything verified up to that point is already on your ledger for the monthly payout.",
  },
];

/* ------------------------------------------------------------------ */
/* Calculator + FAQ (brief §10.6/10.7) — side by side on desktop:      */
/* the interactive math next to the doubts it resolves. Stacked on     */
/* mobile, calculator first.                                           */
/* ------------------------------------------------------------------ */
export function HomeCalculatorFaq() {
  return (
    <section aria-labelledby="calculator" className="mx-auto max-w-site px-6 lg:px-10 py-10 md:py-20">
      <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
        <div>
          <Reveal as="p" className="micro-label">
            Do the math
          </Reveal>
          <Reveal
            as="h2"
            delay={80}
            id="calculator"
            className="display mt-4 text-[clamp(1.75rem,4vw,2.75rem)]"
          >
            What could your clips earn?
          </Reveal>
          <Reveal as="p" delay={140} className="mt-4 max-w-md leading-relaxed text-ink-soft">
            Move the sliders to see what a posting habit could be worth at a
            campaign&apos;s rate.
          </Reveal>
          <Reveal delay={200} className="mt-8">
            <EarningsCalculator />
          </Reveal>
        </div>
        <div>
          <Reveal as="p" className="micro-label">
            Doubts
          </Reveal>
          <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(1.75rem,4vw,2.75rem)]">
            Questions, answered
          </Reveal>
          <Reveal delay={140} className="mt-8">
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA (brief §10.8) — BLACK full-bleed. One line, one pill.     */
/* ------------------------------------------------------------------ */
export function HomeFinalCta() {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-black py-14 text-center text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_120%,rgb(255_255_255/0.14),transparent_70%)]" />
      <div className="mx-auto max-w-site px-6 lg:px-10">
        <Reveal as="h2" className="display mx-auto max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.0] text-white">
          Your clips. Your views. Your money.
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <Link
            href="/login"
            className="group glass-btn-primary min-h-[56px] px-9 py-4 text-base"
          >
            Start clipping{" "}
            <ArrowRight
              size={18}
              aria-hidden
              className="transition-transform duration-micro group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
