"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, Button, Field, inputCls } from "@/components/ui";

const SUPPORT_EMAIL = "support@clipforge.example";

const TOPICS = ["General", "Support", "Partnership", "Brand inquiry"] as const;

const FAQS = [
  {
    q: "How do I become a clipper?",
    a: "Sign in with Google, then add your social accounts under Dashboard → Accounts. Each account gets a unique verification code — put it in that account's bio so our checker can confirm it's yours, and make sure the account has at least 1,000 followers. Once an account is verified as Active, you can join campaigns and submit clip links from it.",
  },
  {
    q: "How do brands start?",
    a: "Brands go to the brand portal and submit a campaign brief (campaign goal, budget, and the rate per 100K views you're offering). Our team reviews every brief, and once approved the campaign goes live so clippers can join. It's a sales-led process for now — you'll hear back within 2 business days.",
  },
  {
    q: "How are views verified?",
    a: "ClipForge reads official view counts from the platform (e.g. YouTube's public API), and snapshots them over time. For platforms without a free API, views are counted from a manual review queue rather than estimated. Only genuine, organically served views count — bought, botted, or otherwise fake engagement is removed and can get an account banned.",
  },
  {
    q: "When do payouts happen?",
    a: "Earnings accrue per verified view at the campaign's stated rate. At the end of each campaign payout cycle, clippers request a payout and the request goes through an admin review before it's released. Keep your clips public until the cycle closes, or the views can't be verified and the earnings may be lost.",
  },
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("General");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[${topic}] Contact from ${name || "a visitor"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-white">Send us a message</h2>
      <p className="mt-1 text-sm text-white/60">
        This opens your email app with everything filled in — nothing is sent automatically.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name">
            <input
              className={inputCls}
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Topic">
          <select
            className={inputCls}
            value={topic}
            onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
          >
            {TOPICS.map((t) => (
              <option key={t} value={t} className="bg-base-900">
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Message">
          <textarea
            className={`${inputCls} min-h-32 resize-y`}
            placeholder="Tell us what's on your mind…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </Field>
        <Button type="submit">Open email app</Button>
      </form>
    </Card>
  );
}

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
      <div className="mt-4 space-y-3">
        {FAQS.map((f, i) => (
          <Card key={i} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="text-sm font-semibold text-white">{f.q}</span>
              <span className="shrink-0 text-lg text-white/50">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">{f.a}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ContactCards() {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-base font-bold text-white">Email us</h2>
        <p className="mt-1 text-sm text-white/60">
          We reply within 2 business days.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </Card>
      <Card className="p-6">
        <h2 className="text-base font-bold text-white">Running a brand?</h2>
        <p className="mt-1 text-sm text-white/60">
          Request a campaign walkthrough and submit your first brief.
        </p>
        <Link
          href="/brand/login"
          className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
        >
          Go to the brand portal →
        </Link>
      </Card>
    </div>
  );
}
