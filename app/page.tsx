import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Scissors, TrendingUp, Users } from "lucide-react";

const STEPS = [
  { n: "01", title: "Pick a campaign", body: "Browse live campaigns from real brands. See the rate, platforms, and bounties up front — then join in one tap." },
  { n: "02", title: "Connect your accounts", body: "Link the TikTok, Reels, Shorts, or X accounts you post from and verify them once." },
  { n: "03", title: "Add your payout method", body: "PayPal or crypto (USDC / USDT). Earnings land automatically when a cycle closes." },
  { n: "04", title: "Drop your clips", body: "Post to your connected accounts, paste the link. Views are pulled straight from the platform." },
  { n: "05", title: "Get paid per view", body: "Earnings climb live as views roll in. Payouts are sent when the cycle closes and views are verified." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-black tracking-tight">CLIPFORGE</span>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white">Sign in</Link>
          <Link href="/login" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-soft">Start clipping</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-20 text-center">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent-soft">Clip · Post · Get Paid</div>
          <h1 className="mx-auto max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            Grow, earn, and go viral with clipping
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            A creative marketplace uniting brands and digital talent. Brands run campaigns;
            clippers craft viral content and get paid per verified view.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-accent px-7 py-3.5 font-bold text-white hover:bg-accent-soft">
              Start clipping <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="rounded-2xl border border-white/15 px-7 py-3.5 font-bold text-white/80 hover:bg-white/5">
              Start a campaign
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-white/40">
            <span className="flex items-center gap-2 text-sm"><TrendingUp size={16} /> 440B+ views tracked</span>
            <span className="flex items-center gap-2 text-sm"><Users size={16} /> 90,000+ clippers</span>
            <span className="flex items-center gap-2 text-sm"><BadgeDollarSign size={16} /> 200+ campaigns</span>
          </div>
        </section>

        <section className="py-16">
          <h2 className="mb-10 text-center text-3xl font-black">Five steps to your first payout</h2>
          <div className="grid gap-4 md:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-base-850 p-5">
                <div className="text-xs font-black text-accent-soft">{s.n}</div>
                <div className="mt-2 font-bold">{s.title}</div>
                <p className="mt-2 text-sm text-white/55">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-3xl font-black">Two sides. One platform.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Clippers get paid per view. Brands get reach they only pay for when it is verified.
          </p>
          <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-base-850 p-8">
              <Scissors className="mb-4 text-accent-soft" size={28} />
              <h3 className="text-xl font-bold">For clippers</h3>
              <p className="mt-2 text-white/55">Free to join · No following required. Pick a campaign, post your clips, watch views turn into earnings.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-base-850 p-8">
              <TrendingUp className="mb-4 text-accent-soft" size={28} />
              <h3 className="text-xl font-bold">For brands</h3>
              <p className="mt-2 text-white/55">Pay per verified view, not per post. Set a budget with a hard cap — you never pay more than you planned.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}
