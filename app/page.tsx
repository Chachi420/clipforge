import Link from "next/link";
import { ArrowRight, Scissors, TrendingUp } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StoryFlow from "@/components/StoryScene";
import { Faq, MarketingFooter } from "@/components/marketing";
import { RevealInit } from "@/components/landing-motion";


const FAQ_ITEMS = [
  { q: "Is it free?", a: "Yes. Joining as a clipper is free — there are no sign-up fees and no subscription. Brands set their own campaign budgets and only pay for verified views." },
  { q: "Do I need followers?", a: "No following required. Campaigns pay per verified view, so a clip can earn from its first hundred views. What matters is the quality of the clip, not the size of your audience." },
  { q: "How do payouts work?", a: "Each campaign runs in payout cycles. When a cycle closes, verified views are converted into earnings at the campaign's published rate, and payouts go to your PayPal or crypto (USDC / USDT) payout method automatically." },
  { q: "How are views verified?", a: "View counts are pulled directly from the platforms, filtered through viewbot detection, and spot-checked by manual review. Only verified views count toward earnings and brand billing." },
  { q: "What does it cost brands?", a: "Brands set their own budget and per-view rate — priced per 100K verified views — with a hard cap. There is no fixed pricing: you spend exactly what you approve, nothing more." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <RevealInit />

      {/* ---------- Nav ---------- */}
      <nav className="sticky top-0 z-40 border-b border-line/[0.07] bg-paper/60 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            CLIPFORGE
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/clip" className="micro-label link-under hover:text-ink">Clippers</Link>
            <Link href="/brands" className="micro-label link-under hover:text-ink">Brands</Link>
            <Link href="/blog" className="micro-label link-under hover:text-ink">Blog</Link>
            <Link href="/docs" className="micro-label link-under hover:text-ink">Docs</Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden text-sm font-semibold text-ink-soft transition-colors hover:text-ink sm:block">
              Sign in
            </Link>
            <Link href="/login" className="pill bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_2px_12px_rgb(7_11_20/0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-ink-soft hover:shadow-[0_6px_20px_rgb(7_11_20/0.22)]">
              Start clipping
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------- The ClipForge Flywheel: scroll-driven 3D story ---------- */}
      <StoryFlow />

      <main className="bg-glow mx-auto max-w-6xl px-6">
        {/* ---------- Two sides: the conversion moment ---------- */}
        <section className="reveal py-24 md:py-36">
          <div className="micro-label mb-6 text-center">Pick your side</div>
          <h2 className="display mx-auto max-w-4xl text-center text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]">
            Two sides.
            <br />
            One platform.
          </h2>
          <div className="mt-14 grid gap-5 text-left md:grid-cols-2">
            <Link href="/clip" className="glass glass-sheen group block rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-lg md:p-12">
              <Scissors className="mb-6 text-electric-deep transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" size={32} />
              <h3 className="display text-3xl md:text-4xl">For clippers</h3>
              <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-ink-soft">Free to join. No following required. Pick a campaign, post your clips, watch views turn into earnings.</p>
              <span className="mt-8 inline-flex items-center gap-2 font-semibold text-electric-deep">
                Start clipping <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
            <Link href="/brands" className="glass glass-sheen group block rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-lg md:p-12">
              <TrendingUp className="mb-6 text-electric-deep transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" size={32} />
              <h3 className="display text-3xl md:text-4xl">For brands</h3>
              <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-ink-soft">Pay per verified view, not per post. Set a budget with a hard cap — never pay more than you planned.</p>
              <span className="mt-8 inline-flex items-center gap-2 font-semibold text-electric-deep">
                Launch a campaign <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
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
