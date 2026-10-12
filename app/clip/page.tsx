import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Trophy, Wallet, Sparkles, BadgeDollarSign } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { Faq, MarketingFooter } from "@/components/marketing";
import { EarningsCalculator } from "./calculator";

export const metadata: Metadata = {
  title: "ClipForge for Clippers — Get Paid Per View",
  description:
    "Post clips for real brand campaigns and earn per verified view. No follower minimums, no sign-up fee — payouts via PayPal or crypto.",
  alternates: { canonical: "/clip" },
};

const STEPS = [
  {
    n: "01",
    title: "Pick a campaign",
    body: "Browse live briefs from real brands. The rate per 100K views, accepted platforms, and bounties are shown up front — no guessing what a post is worth.",
  },
  {
    n: "02",
    title: "Connect your accounts",
    body: "Link the TikTok, Reels, Shorts, or X accounts you post from. One verification per account: a code in your bio, 1,000+ followers.",
  },
  {
    n: "03",
    title: "Add your payout method",
    body: "PayPal or crypto (USDC / USDT). Earnings are calculated at cycle close; admins review before payout.",
  },
  {
    n: "04",
    title: "Post clips",
    body: "Cut clips, post to your connected accounts, paste the links in. Views are pulled straight from the platforms and counted automatically.",
  },
];

const WHY = [
  {
    icon: Sparkles,
    title: "Real brand campaigns",
    body: "Clip for brands running live campaigns with published rates — the brief tells you the rate before you spend an hour editing.",
  },
  {
    icon: BadgeDollarSign,
    title: "Earnings per verified view",
    body: "Every verified view adds to your earnings at the campaign's rate. No flat fees, no exposure-as-payment.",
  },
  {
    icon: Trophy,
    title: "Bounties for standouts",
    body: "Campaigns can attach bounties to specific clips — top performers earn extra on top of per-view pay.",
  },
  {
    icon: Wallet,
    title: "PayPal or crypto",
    body: "USDC / USDT or PayPal. Add your method once; payouts go there after each monthly cycle.",
  },
  {
    icon: ShieldCheck,
    title: "Viewbot detection",
    body: "Platform data plus bot filtering plus manual review. Fake views don't count — and they don't dilute your rates.",
  },
];

const FAQ_ITEMS = [
  { q: "Is joining free?", a: "Yes — completely free. No sign-up fee, no subscription, no cut taken from you. You join, pick a campaign, and post." },
  { q: "Do I need a big following?", a: "No. Campaigns pay per verified view, not per follower. A sharp clip on a small account earns the same per view as one on a big account." },
  { q: "How much can I earn per clip?", a: "It depends on the campaign's rate and your verified views. Try the calculator above with a real campaign rate to see what your clips could be worth. The calculator shows estimates only — actual earnings depend on campaign rates and verified views." },
  { q: "When do I get paid?", a: "Campaigns pay out in monthly cycles. When a cycle closes, your verified views are converted to earnings at the published rate. An admin reviews every cycle, then the payout goes to your PayPal or crypto wallet." },
  { q: "What counts as a verified view?", a: "Views pulled directly from the platform, filtered through viewbot detection and spot-checked by manual review. Only genuine views count toward your earnings." },
];

const TRUST_ROW = ["Free to join", "Paid per verified view", "Cancel anytime"];

export default function ClipLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <p className="micro-label">For clippers</p>
          <h1 className="display mx-auto mt-6 max-w-3xl text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95]">
            Get paid to clip. Per view.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            No following required. Real brand campaigns, automatic view tracking,
            monthly payouts.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="pill min-h-[52px] bg-ink px-9 py-4 text-base font-semibold text-paper transition-colors duration-micro hover:bg-ink-soft"
            >
              Start clipping <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_ROW.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-ink-faint">
                <Check size={16} className="text-ink" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works — editorial rows */}
        <section aria-labelledby="clip-how" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="micro-label">How it works</p>
          <h2 id="clip-how" className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">
            Four steps to your first payout.
          </h2>
          <div className="mt-12 border-t border-line/10">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="grid gap-4 border-b border-line/10 py-8 md:grid-cols-[80px_1fr] md:gap-10 md:py-10"
              >
                <span className="display text-4xl text-ink-faint md:text-5xl" aria-hidden>
                  {s.n}
                </span>
                <div className="max-w-2xl">
                  <h3 className="display text-2xl">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calculator */}
        <section aria-labelledby="clip-calc" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="micro-label text-center">Do the math</p>
          <h2 id="clip-calc" className="display mx-auto mt-4 max-w-2xl text-center text-[clamp(2rem,5vw,3.5rem)]">
            What could your clips earn?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center leading-relaxed text-ink-soft">
            Move the sliders to see what your posting habit could be worth at a
            campaign&apos;s rate.
          </p>
          <div className="mt-10">
            <EarningsCalculator />
          </div>
        </section>

        {/* Why — editorial list, not a card grid */}
        <section aria-labelledby="clip-why" className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <p className="micro-label">Why ClipForge</p>
          <h2 id="clip-why" className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">
            Built for people who already clip.
          </h2>
          <div className="mt-10 border-t border-line/10">
            {WHY.map((w) => (
              <div key={w.title} className="flex gap-5 border-b border-line/10 py-7">
                <w.icon size={24} className="mt-1 shrink-0 text-ink" aria-hidden />
                <div>
                  <h3 className="display text-xl">{w.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                    {w.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="clip-faq" className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <h2 id="clip-faq" className="display text-center text-[clamp(2rem,5vw,3.5rem)]">
            Questions, answered
          </h2>
          <div className="mt-10">
            <Faq items={FAQ_ITEMS} />
          </div>
        </section>

        {/* Final CTA — black */}
        <section className="bg-black py-24 text-center text-white md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="display mx-auto max-w-3xl text-[clamp(2.5rem,7vw,5rem)] leading-[1.0] text-white">
              Your next clip could pay for itself.
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
      </main>

      <MarketingFooter />
    </div>
  );
}
