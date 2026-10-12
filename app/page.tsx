import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { Reveal } from "@/components/motion";
import { EarningsCalculator } from "@/app/clip/calculator";
import {
  HomeHero,
  HomeHowItWorks,
  HomeMoneyMath,
  HomeTwoPaths,
  HomeFaq,
  HomeFinalCta,
} from "@/components/home-sections";

export const metadata: Metadata = {
  title: "ClipForge — Get Paid for Every View Your Clips Earn",
  description:
    "ClipForge is a pay-per-view clipping marketplace. Brands post campaigns with a per-view rate; clippers post clips and earn per verified view.",
  alternates: { canonical: "/" },
};

/**
 * Homepage (brief §10). Narrative order: What → Money → Fit → Start →
 * Doubts → Go. One idea per section. Black reserved for the money math
 * and the final CTA.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />
      <main>
        <HomeHero />
        <HomeHowItWorks />
        <HomeMoneyMath />
        <HomeTwoPaths />

        <section aria-labelledby="calculator" className="mx-auto max-w-6xl px-6 py-10 md:py-20">
          <Reveal as="p" className="micro-label text-center">
            Do the math
          </Reveal>
          <Reveal
            as="h2"
            delay={80}
            id="calculator"
            className="display mx-auto mt-4 max-w-2xl text-center text-[clamp(2rem,5vw,3.5rem)]"
          >
            What could your clips earn?
          </Reveal>
          <Reveal as="p" delay={140} className="mx-auto mt-4 max-w-xl text-center leading-relaxed text-ink-soft">
            Move the sliders to see what a posting habit could be worth at a
            campaign&apos;s rate.
          </Reveal>
          <Reveal delay={200} className="mt-8">
            <EarningsCalculator />
          </Reveal>
        </section>

        <HomeFaq />
        <HomeFinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
