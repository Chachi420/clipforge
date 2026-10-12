import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Faq } from "@/components/marketing";

/* ------------------------------------------------------------------ */
/* Hero (brief §10.2) — white. Kicker, massive H1, one-line subline,    */
/* single CTA, typographic money-equation lockup labeled Illustrative. */
/* ------------------------------------------------------------------ */
export function HomeHero() {
  return (
    <header className="mx-auto flex min-h-[88svh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="micro-label">Pay-per-view clipping marketplace</p>
      <h1 className="display mt-6 max-w-5xl text-[clamp(3rem,10vw,7rem)] leading-[0.95]">
        Get paid for every view your clips earn.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
        Brands post campaigns with a per-view rate. You clip, post, and earn per
        verified view — monthly payouts via PayPal or crypto.
      </p>
      <div className="mt-10">
        <Link
          href="/login"
          className="pill min-h-[52px] bg-ink px-9 py-4 text-base font-semibold text-paper transition-colors duration-micro hover:bg-ink-soft"
        >
          Start clipping <ArrowRight size={18} aria-hidden />
        </Link>
      </div>

      {/* Money equation lockup */}
      <div className="mt-14 w-full max-w-3xl">
        <div className="flex flex-col items-stretch justify-center gap-3 rounded-card border border-line/10 bg-surface px-6 py-6 sm:flex-row sm:items-center sm:gap-6">
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
    </header>
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
    <section aria-labelledby="how-it-works" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <p className="micro-label">How it works</p>
      <h2 id="how-it-works" className="display mt-4 max-w-2xl text-[clamp(2rem,5vw,3.5rem)]">
        Three steps. No pitch decks.
      </h2>
      <div className="mt-12">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`border-t border-line/10 py-10 md:py-12 ${
              i === 1 ? "md:ml-24" : i === 2 ? "md:ml-48" : ""
            } ${i === STEPS.length - 1 ? "border-b" : ""}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-10">
              <span className="display text-5xl text-ink-faint md:text-6xl" aria-hidden>
                {s.n}
              </span>
              <div className="max-w-xl">
                <h3 className="display text-2xl md:text-3xl">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Money math (brief §10.4) — BLACK full-bleed. The entire model in    */
/* one equation.                                                       */
/* ------------------------------------------------------------------ */
export function HomeMoneyMath() {
  return (
    <section aria-labelledby="money-math" className="bg-black py-20 text-white md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
          The business model
        </p>
        <p
          id="money-math"
          className="display mt-8 text-[clamp(2.25rem,8vw,5.5rem)] leading-[1.05] text-white"
        >
          100K verified views × $40/100K = $40
        </p>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
          That&apos;s the entire business model.
        </p>
        <p className="mt-4 text-xs text-white/40">
          Illustrative example — each campaign sets its own rate.
        </p>
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
          className="pill min-h-[44px] bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors duration-micro hover:bg-ink-soft"
        >
          {ctaLabel} <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function HomeTwoPaths() {
  return (
    <section aria-labelledby="two-paths" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <p className="micro-label">Two ways in</p>
      <h2 id="two-paths" className="display mt-4 max-w-2xl text-[clamp(2rem,5vw,3.5rem)]">
        Clippers earn. Brands pay for views.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <PathPanel
          kicker="For clippers"
          title="Already posting clips? Get paid for it."
          body="Pick a brief, post to your own accounts, and watch verified views turn into money."
          bullets={CLIPPER_BULLETS}
          ctaLabel="Start clipping"
          ctaHref="/login"
        />
        <PathPanel
          kicker="For brands"
          title="Stop paying for posts. Pay for views."
          body="Set a rate, cap the budget, and pay only for verified reach. If nobody watches, you pay nothing."
          bullets={BRAND_BULLETS}
          ctaLabel="Start a campaign"
          ctaHref="/brand/request"
        />
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
];

export function HomeFaq() {
  return (
    <section aria-labelledby="faq" className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <h2 id="faq" className="display text-center text-[clamp(2rem,5vw,3.5rem)]">
        Questions, answered
      </h2>
      <div className="mt-10">
        <Faq items={FAQ_ITEMS} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA (brief §10.8) — BLACK full-bleed. One line, one pill.     */
/* ------------------------------------------------------------------ */
export function HomeFinalCta() {
  return (
    <section className="bg-black py-24 text-center text-white md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="display mx-auto max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.0] text-white">
          Your clips. Your views. Your money.
        </h2>
        <div className="mt-10">
          <Link
            href="/login"
            className="pill min-h-[52px] bg-white px-9 py-4 text-base font-semibold text-black transition-colors duration-micro hover:bg-white/85"
          >
            Start clipping <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
