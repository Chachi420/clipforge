import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/JsonLd";
import {
  HomeHero,
  HomeClipShowcase,
  HomeHowItWorks,
  HomeMoneyMath,
  HomeTwoPaths,
  HomeCalculatorFaq,
  HomeFinalCta,
} from "@/components/home-sections";
import { BrandMarquee } from "@/components/showcase";
import { getShowcaseBrands, getShowcaseClips } from "@/lib/showcase";

// Live brands + clips, refreshed every 10 minutes (static otherwise).
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Wondeed — Get Paid for Every View Your Clips Earn",
  description:
    "Wondeed is a pay-per-view clipping marketplace. Brands post campaigns with a per-view rate; clippers post clips and earn per verified view.",
  alternates: { canonical: "/" },
};

/**
 * Homepage (brief §10). Narrative order: What → Money → Fit → Start →
 * Doubts → Go. One idea per section. Black reserved for the money math
 * and the final CTA.
 */
export default async function Landing() {
  const [brands, clips] = await Promise.all([getShowcaseBrands(), getShowcaseClips()]);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <MarketingNav />
      <main>
        <HomeHero clips={clips} />
        <BrandMarquee brands={brands} />
        <HomeHowItWorks />
        <HomeClipShowcase clips={clips} />
        <HomeMoneyMath />
        <HomeTwoPaths />
        <HomeCalculatorFaq />
        <HomeFinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
