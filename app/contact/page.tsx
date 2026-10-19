import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { ContactForm, FaqAccordion, ContactCards } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — Wondeed",
  description: "Questions, partnerships, or campaign inquiries — reach the Wondeed team.",
  alternates: { canonical: "/contact" },
};

/**
 * Contact page (brief §11). Keeps the built form, reskinned chrome.
 * Copy rule: no invented response-time promises.
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <h1 className="display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95]">
          Talk to a human.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Questions, partnerships, or campaign inquiries — every message is read
          by someone on the team.
        </p>

        <div className="mt-12">
          <ContactCards />
        </div>

        <div className="mt-10 max-w-3xl">
          <ContactForm />
        </div>

        <div className="mt-16 max-w-3xl">
          <FaqAccordion />
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
