import Link from "next/link";
import { ArrowRight, Scissors, TrendingUp } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";
import StoryNarrative from "@/components/StoryNarrative";
import Hero from "@/components/Hero";
import { Faq, MarketingFooter } from "@/components/marketing";
import { RevealInit } from "@/components/landing-motion";


const FAQ_ITEMS = [
  { q: "I have 200 followers. Can I actually earn?", a: "Yes — that's the whole point. You get paid per view, not per follower. A sharp clip from a small account routinely outperforms a lazy one from a big account. The view counter doesn't care about your follower count." },
  { q: "How do I know the view counts are real?", a: "We pull numbers directly from the platform APIs, strip out bot traffic, and humans spot-check the rest. Brands see the same dashboard you do — if a view didn't happen, nobody pays for it and nobody earns from it." },
  { q: "When do I actually get paid?", a: "Campaigns run in weekly cycles. When a cycle closes, your verified views convert to earnings at the campaign's published rate, sent to your PayPal or crypto wallet. No minimum threshold games, no 90-day holds." },
  { q: "How are views verified?", a: "View counts are pulled directly from the platforms, filtered through viewbot detection, and spot-checked by manual review. Only verified views count toward earnings and brand billing." },
  { q: "What does it cost brands?", a: "Brands set their own budget and per-view rate — priced per 100K verified views — with a hard cap. There is no fixed pricing: you spend exactly what you approve, nothing more." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <RevealInit />

      {/* ---------- Nav ---------- */}
      <nav className="sticky top-0 z-40 border-b border-line/[0.07] bg-paper/60 backdrop-blur-2xl backdrop-saturate-150">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-6 md:py-3.5">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            CLIPFORGE
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/clip" className="micro-label link-under hover:text-ink">Clippers</Link>
            <Link href="/brands" className="micro-label link-under hover:text-ink">Brands</Link>
            <Link href="/blog" className="micro-label link-under hover:text-ink">Blog</Link>
            <Link href="/docs" className="micro-label link-under hover:text-ink">Docs</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden text-sm font-semibold text-ink-soft transition-colors hover:text-ink sm:block">
              Sign in
            </Link>
            <Link href="/login" className="pill bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_2px_12px_rgb(7_11_20/0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-ink-soft hover:shadow-[0_6px_20px_rgb(7_11_20/0.22)]">
              Start clipping
            </Link>
            <MobileMenu />
          </div>
        </div>
      </nav>

      <Hero />

      {/* ---------- The story: scroll-driven typographic narrative ---------- */}
      <StoryNarrative />

      <main className="bg-glow mx-auto max-w-6xl px-6">
        {/* ---------- Do the math ---------- */}
        <section className="reveal py-16 md:py-24">
          <div className="border-y border-ink/15 py-10 md:py-14">
            <div className="micro-label mb-6">How the money works</div>
            <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center md:gap-8">
              <div className="flex items-baseline gap-3 md:block">
                <span className="display text-4xl md:text-5xl">100K</span>
                <span className="text-sm text-ink-soft md:mt-2 md:block">verified views on your clip</span>
              </div>
              <div className="hidden display text-2xl text-ink-faint md:block">×</div>
              <div className="flex items-baseline gap-3 border-t border-ink/10 pt-6 md:block md:border-0 md:pt-0">
                <span className="display text-4xl md:text-5xl">$40</span>
                <span className="text-sm text-ink-soft md:mt-2 md:block">the brand&apos;s rate per 100K</span>
              </div>
              <div className="hidden display text-2xl text-ink-faint md:block">=</div>
              <div className="flex items-baseline gap-3 border-t border-ink/10 pt-6 md:block md:border-0 md:pt-0">
                <span className="display text-4xl text-electric-deep md:text-5xl">$40</span>
                <span className="text-sm text-ink-soft md:mt-2 md:block">in your pocket. That&apos;s the math.</span>
              </div>
            </div>
            <p className="mt-8 text-xs text-ink-faint">Illustrative example — each campaign sets its own rate.</p>
          </div>
        </section>

        {/* ---------- Two sides: pick your path ---------- */}
        <section className="reveal py-24 md:py-36">
          <div className="micro-label mb-6">Two ways in</div>
          <h2 className="display max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]">
            Which one
            <br />
            are you?
          </h2>

          <div className="mt-14 space-y-5">
            <Link href="/clip" className="group block border-t border-ink/15 py-10 transition-colors hover:bg-ink/[0.02] md:py-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <div className="mb-3 flex items-center gap-3">
                    <Scissors size={20} className="text-electric-deep" />
                    <span className="micro-label">For clippers</span>
                  </div>
                  <p className="display text-2xl leading-snug md:text-[2rem]">
                    You&apos;re already posting clips for free.{" "}
                    <span className="text-ink-faint">Might as well get paid for it.</span>
                  </p>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
                    Free to join, no follower minimum. Pick a brief, post, and watch the view counter turn into money.
                  </p>
                </div>
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-all duration-300 group-hover:border-electric group-hover:bg-electric group-hover:text-white">
                  <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>

            <Link href="/brands" className="group block border-t border-b border-ink/15 py-10 transition-colors hover:bg-ink/[0.02] md:py-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <div className="mb-3 flex items-center gap-3">
                    <TrendingUp size={20} className="text-electric-deep" />
                    <span className="micro-label">For brands</span>
                  </div>
                  <p className="display text-2xl leading-snug md:text-[2rem]">
                    Stop paying for posts.{" "}
                    <span className="text-ink-faint">Pay for the views that actually happened.</span>
                  </p>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
                    Set a rate per view, cap the budget, and only pay for verified reach. If nobody watches, you pay nothing.
                  </p>
                </div>
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-all duration-300 group-hover:border-electric group-hover:bg-electric group-hover:text-white">
                  <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* ---------- FAQ: objection handling, trimmed ---------- */}
        <section className="reveal py-24 md:py-32">
          <h2 className="display mb-12 text-center text-[clamp(2rem,5vw,3.5rem)]">Questions, answered</h2>
          <div className="mx-auto max-w-2xl">
            <Faq items={FAQ_ITEMS.slice(0, 3)} />
          </div>
          <p className="mt-8 text-center">
            <Link href="/docs" className="link-under text-sm font-semibold text-ink-soft hover:text-ink">
              More in the docs →
            </Link>
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
