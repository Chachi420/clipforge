import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles, Trophy, Wallet } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Faq, MarketingFooter } from "@/components/marketing";
import { EarningsCalculator } from "./calculator";

const STEPS = [
  { n: "01", title: "Pick a campaign", body: "Browse campaigns from real brands. The rate, platforms, and bounties are shown up front." },
  { n: "02", title: "Connect your accounts", body: "Link the TikTok, Reels, Shorts, or X accounts you post from and verify them once." },
  { n: "03", title: "Add your payout method", body: "PayPal or crypto (USDC / USDT). Earnings land automatically when a cycle closes." },
  { n: "04", title: "Drop your clips", body: "Post to your connected accounts and paste the link. Views are pulled straight from the platform." },
  { n: "05", title: "Get paid per view", body: "Earnings climb live as views roll in. Payouts are sent once the cycle closes and views are verified." },
];

const WHY = [
  { icon: Sparkles, title: "Real brand campaigns", body: "Clip for brands running live campaigns with published rates — no guessing what a post is worth." },
  { icon: Trophy, title: "Earnings per verified view", body: "Every verified view adds to your earnings at the campaign's rate. Views are tracked automatically." },
  { icon: ShieldCheck, title: "Bounties for standouts", body: "Campaigns can attach bounties to specific clips — top performers earn extra on top of per-view pay." },
  { icon: Wallet, title: "Flexible payouts", body: "Get paid in PayPal or crypto (USDC / USDT). No complicated invoicing." },
  { icon: Check, title: "Viewbot detection", body: "Platform data plus bot filtering plus manual review. Fake views don't count — and they don't dilute your rates." },
];

const FAQ_ITEMS = [
  { q: "Is joining free?", a: "Yes — completely free. No sign-up fee, no subscription, no cut taken from you. You join, pick a campaign, and post." },
  { q: "Do I need a big following?", a: "No. Campaigns pay per verified view, not per follower. A sharp clip on a small account earns the same per view as one on a big account." },
  { q: "How much can I earn per clip?", a: "It depends on the campaign's rate and your verified views. Try the calculator above with a real campaign rate to see what your clips could be worth. The calculator shows estimates only — actual earnings depend on campaign rates and verified views." },
  { q: "When do I get paid?", a: "Campaigns pay out in cycles. When a cycle closes, your verified views are converted to earnings at the published rate and sent to your PayPal or crypto payout method automatically." },
  { q: "What counts as a verified view?", a: "Views pulled directly from the platform, filtered through viewbot detection and spot-checked by manual review. Only genuine views count toward your earnings." },
];

export default function ClipLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav className="sticky top-0 z-40 border-b border-line/10 bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">CLIPFORGE</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-semibold text-ink-soft hover:text-ink">Sign in</Link>
            <Link href="/login" className="pill bg-lime px-5 py-2.5 text-sm font-bold text-ink hover:bg-lime-soft">Start clipping</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-20 text-center">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-lime-deep">For clippers</div>
          <h1 className="display mx-auto max-w-3xl text-5xl leading-[0.95] md:text-6xl">
            Get paid to clip. Per view.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft">
            No following required. Real brand campaigns, automatic view tracking, fast payouts.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/login" className="pill inline-flex items-center gap-2 bg-lime px-7 py-3.5 font-bold text-ink shadow-glow-lime hover:bg-lime-soft">
              Start clipping <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-ink-faint">
            <span className="flex items-center gap-2 text-sm"><Check size={16} className="text-lime-deep" /> Free to join</span>
            <span className="flex items-center gap-2 text-sm"><Check size={16} className="text-lime-deep" /> Paid per verified view</span>
            <span className="flex items-center gap-2 text-sm"><Check size={16} className="text-lime-deep" /> Cancel anytime</span>
          </div>
        </section>

        <section className="py-16">
          <h2 className="display mb-10 text-center text-4xl md:text-5xl">How it works</h2>
          <div className="grid gap-4 md:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.n} className="glass glass-sheen rounded-3xl p-5">
                <div className="text-xs font-black text-lime-deep">{s.n}</div>
                <div className="mt-2 font-bold text-ink">{s.title}</div>
                <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <h2 className="display mb-4 text-center text-4xl md:text-5xl">What could your clips earn?</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-ink-soft">
            Move the sliders to see what your posting habit could be worth at a campaign&apos;s rate.
          </p>
          <EarningsCalculator />
        </section>

        <section className="py-16">
          <h2 className="display mb-10 text-center text-4xl md:text-5xl">Why ClipForge</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title} className="glass glass-sheen rounded-3xl p-8">
                <w.icon className="mb-4 text-lime-deep" size={28} />
                <h3 className="font-display text-lg font-bold tracking-tight">{w.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <h2 className="display mb-10 text-center text-4xl md:text-5xl">Questions, answered</h2>
          <div className="mx-auto max-w-3xl">
            <Faq items={FAQ_ITEMS} />
          </div>
        </section>

        <section className="py-16">
          <div className="glass-dark glass-sheen glow-lime rounded-[2rem] p-10 text-center text-white md:p-14">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Your clips. Your views. Your money.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Join free, pick a campaign, and start turning views into payouts.
            </p>
            <div className="mt-8">
              <Link href="/login" className="pill inline-flex items-center gap-2 bg-lime px-7 py-3.5 font-bold text-ink shadow-glow-lime hover:bg-lime-soft">
                Start clipping <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
