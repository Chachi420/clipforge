import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { Reveal } from "@/components/motion";
import { JsonLd, faqPageSchema } from "@/components/JsonLd";
import { FaqGroup } from "./FaqGroup";

export const metadata: Metadata = {
  title: "FAQ — ClipForge",
  description:
    "Straight answers about how ClipForge works — for clippers and brands. Verification, payouts, pricing, and view tracking.",
  alternates: { canonical: "/faq" },
};

/**
 * Every answer below is grounded in real platform behavior:
 * - Bio-code verification — lib/actions.ts (connectSocialAccount / verifySocialAccount)
 * - Clips held in pending_review until admin approves — lib/actions.ts (uploadClips)
 * - Monthly payout cycles, $10 minimum, carryover — lib/payout-math.ts
 *   (MIN_PAYOUT_USD), app/api/cron/close-payout-cycle/route.ts
 * - Brand prepay + budget caps — lib/brand-actions.ts
 * - View sources: YouTube Data API, Instagram via Apify — lib/youtube.ts, lib/apify.ts
 */

const CLIPPER_FAQ: { q: string; a: string }[] = [
  {
    q: "How do I get my account verified?",
    a: "Connect your account from your dashboard and you'll get a unique verification code. Put that code in the account's bio. For YouTube, our bot checks the bio automatically. For Instagram, our bot checks the bio too. Only YouTube and Instagram are supported at launch — TikTok and X aren't available yet.",
  },
  {
    q: "What happens after I submit a clip?",
    a: "Every clip sits in pending review until an admin approves it — usually to confirm it's from one of your verified accounts and fits the campaign. Only approved clips get tracked for views. Rejected clips come back with a reason so you know what to fix.",
  },
  {
    q: "How are my views counted?",
    a: "YouTube views come straight from the YouTube Data API. Instagram views are fetched through our view-tracking integration. We take a snapshot the moment you upload, then refresh all clips once daily, so only genuine accumulated views count toward your earnings — sudden spikes get flagged for review.",
  },
  {
    q: "When do I get paid?",
    a: "Earnings settle in monthly payout cycles, one per campaign per calendar month. Once a cycle closes and your balance clears the $10 payout minimum, it's marked for payment. If you're under $10, the balance carries forward into the next month — it never expires or gets dropped.",
  },
  {
    q: "Can a campaign reject my views?",
    a: "Campaigns can set minimum view thresholds per post and per clipper. Clips below the per-post minimum don't count toward earnings at all — that's the brand's quality filter, and it's visible before you submit, so there are no surprises.",
  },
  {
    q: "What gets me suspended?",
    a: "Fake engagement — viewbots, engagement pods, bought views. Our scan looks for view spikes that don't match real viewing patterns, and flagged clips go to manual review. Suspended accounts can't upload or earn. If you think a flag was wrong, you can appeal through the Grievance Officer page.",
  },
];

const BRAND_FAQ: { q: string; a: string }[] = [
  {
    q: "How do campaigns get priced?",
    a: "You set a budget cap and a per-view rate for your campaign. Clippers earn based on verified views at your rate, and ClipForge's platform fee is agreed per campaign (standard rate 20% of spend). There are no setup fees, subscriptions, or seat charges — money only moves when views happen.",
  },
  {
    q: "Do I pay before the campaign runs?",
    a: "Yes — brands top up their balance before a campaign goes live. It's prepay only. Your spend can never exceed your budget cap: when the budget runs out, the campaign pauses automatically and clippers stop earning against it.",
  },
  {
    q: "How do I know the views are real?",
    a: "Three layers. First, clippers can only post from verified accounts — accounts they proved they own with a bio code. Second, views come from official sources — the YouTube Data API for YouTube, our tracking integration for Instagram — not self-reported numbers. Third, spike detection flags unnatural view patterns for manual review before they count toward your spend.",
  },
  {
    q: "Who approves the clips?",
    a: "Every clip passes admin review before it's tracked. That means a human confirms the clip is from a verified account and fits your campaign before a single view counts toward your budget. You can also set minimum view thresholds per post so low-effort clips never earn.",
  },
  {
    q: "What budget ranges do you work with?",
    a: "When you request brand access you pick a rough range: under $1K, $1K–$5K, $5K–$25K, or $25K and up. That helps us match you with the right clippers and campaign setup. Your per-campaign budget cap is what actually controls spend.",
  },
  {
    q: "Can I pause or stop a campaign?",
    a: "Yes. Campaigns pause automatically when the budget cap is hit, and you can pause manually any time from your dashboard. Remaining budget stays in your balance for future campaigns.",
  },
  {
    q: "What do I get in the dashboard?",
    a: "A live view of verified views per clip, spend against your budget cap, and which clippers are driving reach. Payout cycles close monthly, so you always know exactly what each month cost and what it bought.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <JsonLd data={faqPageSchema([...CLIPPER_FAQ, ...BRAND_FAQ])} />
      <MarketingNav
        ctaHref="/brand/request"
        ctaLabel="Start a campaign"
        signInHref="/login"
        signInLabel="Sign in"
      />

      <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <Reveal as="p" className="micro-label">
          FAQ
        </Reveal>
        <Reveal as="h1" className="display mt-4 text-4xl md:text-5xl">
          Questions, answered straight.
        </Reveal>
        <Reveal as="p" className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
          No marketing gloss — just how the platform actually works.
        </Reveal>

        <div className="mt-12 space-y-16 md:mt-16">
          <Reveal>
            <FaqGroup title="For clippers" items={CLIPPER_FAQ} />
          </Reveal>
          <Reveal>
            <FaqGroup title="For brands" items={BRAND_FAQ} />
          </Reveal>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
