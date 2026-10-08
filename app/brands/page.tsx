import Link from "next/link";
import { ArrowRight, BarChart3, Check, Gauge, HandCoins, Users } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Faq, MarketingFooter } from "@/components/marketing";

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
  { icon: HandCoins, title: "Pay per verified view", body: "You pay for reach that actually happened — not per post, not per follower, not per promise." },
  { icon: Gauge, title: "Budget hard caps", body: "Set the budget up front. The campaign stops at your cap, so you never overspend." },
  { icon: Users, title: "Rates that attract talent", body: "You propose the per-view rate, and above-market rates pull in the clippers who can actually move the needle." },
  { icon: BarChart3, title: "Live analytics", body: "Watch verified views and spend in real time, clip by clip, instead of waiting for a post-campaign report." },
];

const FAQ_ITEMS = [
  { q: "How much does it cost?", a: "You set the budget and the per-view rate — priced per 100K verified views — with a hard cap. There is no fixed pricing: you spend exactly what you approve, and the campaign never goes over your cap." },
  { q: "Do I need to manage anything?", a: "No — campaigns are managed. You submit a brief, we run it with the clipper community, and you watch results on a live dashboard. You can check in any time, but there is nothing you have to operate." },
  { q: "How are views verified?", a: "View counts come straight from the platforms, are filtered through viewbot detection, and are spot-checked by manual review. You only pay for views that survive all three layers." },
];

export default function BrandsLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav className="sticky top-0 z-40 border-b border-line/10 bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">CLIPFORGE</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/brand/login" className="text-sm font-semibold text-ink-soft hover:text-ink">Brand sign in</Link>
            <Link href="/brand/request" className="pill bg-lime px-5 py-2.5 text-sm font-bold text-ink hover:bg-lime-soft">Start a campaign</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-20 text-center">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-lime-deep">For brands</div>
          <h1 className="display mx-auto max-w-3xl text-5xl leading-[0.95] md:text-6xl">
            Turn your content into a wall of clips.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft">
            Tell us the goal. We run the campaign. You pay only for verified views.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/brand/request" className="pill inline-flex items-center gap-2 bg-lime px-7 py-3.5 font-bold text-ink shadow-glow-lime hover:bg-lime-soft">
              Start a campaign <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="pill border border-line/15 px-7 py-3.5 font-bold text-ink hover:bg-ink/5">
              Talk to us
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-ink-faint">
            <span className="flex items-center gap-2 text-sm"><Check size={16} className="text-lime-deep" /> Pay per verified view</span>
            <span className="flex items-center gap-2 text-sm"><Check size={16} className="text-lime-deep" /> Hard budget caps</span>
            <span className="flex items-center gap-2 text-sm"><Check size={16} className="text-lime-deep" /> Cancel anytime</span>
          </div>
        </section>

        <section className="py-16">
          <h2 className="display mb-10 text-center text-4xl md:text-5xl">Three steps, fully managed</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="glass glass-sheen rounded-3xl p-8">
                <div className="text-xs font-black text-lime-deep">{s.n}</div>
                <div className="mt-2 font-display text-xl font-bold tracking-tight">{s.title}</div>
                <p className="mt-2 text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <h2 className="display mb-10 text-center text-4xl md:text-5xl">Why brands choose ClipForge</h2>
          <div className="grid gap-4 md:grid-cols-2">
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
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Buy reach, not promises.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Brief your campaign in minutes, watch verified views roll in on a live dashboard, and never spend more than your cap.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/brand/login" className="pill inline-flex items-center gap-2 bg-lime px-7 py-3.5 font-bold text-ink shadow-glow-lime hover:bg-lime-soft">
                Start a campaign <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="pill border border-white/20 px-7 py-3.5 font-bold text-white/85 hover:bg-white/10">
                Talk to us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
