"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/* ---------- FAQ accordion ---------- */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-base-850">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
          >
            <span className="font-bold">{it.q}</span>
            <ChevronDown
              size={18}
              className={`shrink-0 text-accent-soft transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">{it.a}</p>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Generic tabs ---------- */
export function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="mx-auto mb-8 flex w-fit rounded-2xl border border-white/10 bg-base-850 p-1.5">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-colors ${
              active === i ? "bg-accent text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs[active].content}
    </div>
  );
}

/* ---------- Shared footer ---------- */
export function MarketingFooter() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/clip", label: "For clippers" },
    { href: "/brands", label: "For brands" },
    { href: "/blog", label: "Blog" },
    { href: "/docs", label: "Docs" },
    { href: "/contact", label: "Contact" },
  ];
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
      <div className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="hover:text-white">
            {l.label}
          </a>
        ))}
      </div>
      <div>ClipForge — a demo rebuild for product research.</div>
    </footer>
  );
}

/* ---------- Shared CTA band ---------- */
export function CtaBand({
  title,
  body,
  clipperHref = "/login",
  brandHref = "/brand/login",
}: {
  title: string;
  body: string;
  clipperHref?: string;
  brandHref?: string;
}) {
  return (
    <section className="py-16">
      <div className="rounded-2xl border border-white/10 bg-base-850 p-10 text-center md:p-14">
        <h2 className="text-3xl font-black md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/60">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={clipperHref}
            className="rounded-2xl bg-accent px-7 py-3.5 font-bold text-white hover:bg-accent-soft"
          >
            Start clipping
          </a>
          <a
            href={brandHref}
            className="rounded-2xl border border-white/15 px-7 py-3.5 font-bold text-white/80 hover:bg-white/5"
          >
            Start a campaign
          </a>
        </div>
      </div>
    </section>
  );
}
