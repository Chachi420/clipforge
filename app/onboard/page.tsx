import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clapperboard, Megaphone } from "lucide-react";
import { Card } from "@/components/ui";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Get started — Wondeed",
  description:
    "Join Wondeed as a clipper and earn per verified view, or as a brand running pay-per-view campaigns.",
  alternates: { canonical: "/onboard" },
};

const ROLES = [
  {
    icon: Clapperboard,
    title: "I'm a clipper",
    tagline: "Earn per view",
    body: "Connect your accounts, get verified, and post clips to live campaigns. You earn for every verified view your clips pull in — payouts settle monthly.",
    href: "/login",
    cta: "Start clipping",
  },
  {
    icon: Megaphone,
    title: "I'm a brand",
    tagline: "Run campaigns",
    body: "Set a budget cap and a per-view rate, fund your balance, and watch verified views roll in on a live dashboard. You only pay for real views.",
    href: "/brand/login",
    cta: "Start a campaign",
  },
];

export default function OnboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <nav aria-label="Onboarding" className="border-b border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            WONDEED
          </Link>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12">
        <Reveal as="p" className="micro-label text-center">
          Get started
        </Reveal>
        <Reveal as="h1" className="display mt-4 text-center text-4xl md:text-5xl">
          Which one are you?
        </Reveal>
        <Reveal as="p" className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-ink-soft md:text-base">
          Two ways in. Pick the one that fits — you can always add the other later.
        </Reveal>

        <div className="mx-auto mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08} className="h-full">
              <Link
                href={r.href}
                className="block h-full"
                aria-label={`${r.title} — ${r.cta}`}
              >
                <Card className="flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-1 md:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15">
                    <r.icon size={22} strokeWidth={1.8} />
                  </span>
                  <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-ink-faint">
                    {r.tagline}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{r.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {r.body}
                  </p>
                  <span className="pill btn-liquid mt-6 inline-flex min-h-[44px] w-fit items-center gap-2 px-6 text-sm font-semibold">
                    {r.cta} <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
    </div>
  );
}
