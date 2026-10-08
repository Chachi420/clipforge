import type { Metadata } from "next";
import { ContactForm, FaqAccordion, ContactCards } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — ClipForge",
  description: "Questions, partnerships, or campaign inquiries — reach the ClipForge team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-base-950">
      <main className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-4xl font-black text-white">Contact ClipForge</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Questions, partnerships, or campaign inquiries — we reply within 2 business days.
        </p>

        <ContactCards />

        <div className="mt-10">
          <ContactForm />
        </div>

        <FaqAccordion />
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}
