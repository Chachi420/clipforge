import type { Metadata } from "next";
import { ContactForm, FaqAccordion, ContactCards } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — ClipForge",
  description: "Questions, partnerships, or campaign inquiries — reach the ClipForge team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="display text-4xl md:text-5xl">Contact ClipForge</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Questions, partnerships, or campaign inquiries — we reply within 2 business days.
        </p>

        <ContactCards />

        <div className="mt-10">
          <ContactForm />
        </div>

        <FaqAccordion />
      </main>
      <footer className="border-t border-line/10 py-8 text-center text-sm text-ink-faint">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}
