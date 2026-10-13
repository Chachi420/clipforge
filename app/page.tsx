import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import {
  HomeHero,
  HomeHowItWorks,
  HomeMoneyMath,
  HomeTwoPaths,
  HomeCalculatorFaq,
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
        <HomeCalculatorFaq />
        <HomeFinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
