import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Check, Scissors, TrendingUp, Users } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StoryFlow from "@/components/StoryScene";
import { Faq, MarketingFooter, CtaBand } from "@/components/marketing";
import { RevealInit } from "@/components/landing-motion";

const CLIPPER_WINS = ["Free to join", "Paid per verified view", "Withdraw via PayPal or crypto"];
const BRAND_WINS = ["Hard budget caps — never overspend", "Viewbot detection + manual review", "Live dashboard for views and spend"];

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
      <nav className="sticky top-0 z-40 border-b border-line/10 bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            CLIPFORGE
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/clip" className="micro-label hover:text-ink">Clippers</Link>
            <Link href="/brands" className="micro-label hover:text-ink">Brands</Link>
            <Link href="/blog" className="micro-label hover:text-ink">Blog</Link>
            <Link href="/docs" className="micro-label hover:text-ink">Docs</Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden text-sm font-semibold text-ink-soft hover:text-ink sm:block">
              Sign in
            </Link>
            <Link href="/login" className="pill bg-ink px-5 py-2.5 text-sm text-paper hover:bg-ink-soft">
              Start clipping
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------- The ClipForge Flywheel: scroll-driven 3D story ---------- */}
      <StoryFlow />

      <main className="mx-auto max-w-6xl px-6">
        {/* ---------- Dark contrast card ---------- */}
        <section className="reveal py-16">
          <div className="glass-dark glass-sheen glow-electric rounded-[2rem] p-10 text-white md:p-14">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-electric-soft">Why ClipForge</div>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Pay for views.
                  <br />
                  Not promises.
                </h2>
              </div>
              <ul className="space-y-5">
                {[
                  { icon: TrendingUp, t: "Pay per verified view", d: "View counts pulled from the platforms, filtered for bots, spot-checked by hand." },
                  { icon: Users, t: "No following required", d: "A clip earns from its first hundred views. Quality beats audience size." },
                  { icon: BadgeDollarSign, t: "Payouts after review", d: "Cycles close, views are verified, money moves to PayPal or crypto." },
                ].map((f) => (
                  <li key={f.t} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/20 text-electric-soft">
                      <f.icon size={20} />
                    </span>
                    <span>
                      <span className="block font-bold">{f.t}</span>
                      <span className="mt-1 block text-sm text-white/60">{f.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Two sides ---------- */}
        <section className="reveal py-16">
          <h2 className="display text-center text-4xl md:text-5xl">Two sides. One platform.</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-soft">
            Clippers get paid per view. Brands get reach they only pay for when it is verified.
          </p>
          <div className="mt-10 grid gap-5 text-left md:grid-cols-2">
            <div className="glass glass-sheen rounded-[2rem] p-8 md:p-10">
              <Scissors className="mb-4 text-electric-deep" size={28} />
              <h3 className="font-display text-2xl font-bold tracking-tight">For clippers</h3>
              <p className="mt-2 text-ink-soft">Free to join · No following required. Pick a campaign, post your clips, watch views turn into earnings.</p>
              <ul className="mt-6 space-y-2.5">
                {CLIPPER_WINS.map((w) => (
                  <li key={w} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                    <Check size={15} className="shrink-0 text-electric-deep" /> {w}
                  </li>
                ))}
              </ul>
              <Link href="/clip" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-electric-deep hover:text-ink">
                How it works for clippers <ArrowRight size={15} />
              </Link>
            </div>
            <div className="glass glass-sheen rounded-[2rem] p-8 md:p-10">
              <TrendingUp className="mb-4 text-electric-deep" size={28} />
              <h3 className="font-display text-2xl font-bold tracking-tight">For brands</h3>
              <p className="mt-2 text-ink-soft">Pay per verified view, not per post. Set a budget with a hard cap — you never pay more than you planned.</p>
              <ul className="mt-6 space-y-2.5">
                {BRAND_WINS.map((w) => (
                  <li key={w} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                    <Check size={15} className="shrink-0 text-electric-deep" /> {w}
                  </li>
                ))}
              </ul>
              <Link href="/brands" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-electric-deep hover:text-ink">
                How it works for brands <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="reveal py-16">
          <h2 className="display mb-10 text-center text-4xl md:text-5xl">Questions, answered</h2>
          <div className="mx-auto max-w-3xl">
            <Faq items={FAQ_ITEMS} />
          </div>
        </section>

        <div className="reveal">
          <CtaBand
            title="Ready when you are."
            body="Join free as a clipper and start earning per verified view — or launch a campaign and only pay for reach that actually happened."
          />
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
