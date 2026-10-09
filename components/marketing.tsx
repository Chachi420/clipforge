"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/* ---------- FAQ accordion ---------- */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="glass rounded-3xl">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
          >
            <span className="font-bold text-ink">{it.q}</span>
            <ChevronDown
              size={18}
              className={`shrink-0 text-electric-deep transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{it.a}</p>}
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
      <div className="glass mx-auto mb-8 flex w-fit rounded-full p-1.5">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
              active === i ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
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

/* ---------- Shared footer (Vectr finale) ---------- */
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
    <footer className="bg-night text-ice/70">
      <div className="mx-auto max-w-6xl px-6 pt-14">
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ice">
              {l.label}
            </a>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-ice/40">ClipForge — a demo rebuild for product research.</div>
      </div>
      <div className="mt-12 overflow-hidden border-t border-ice/10 px-4 pt-8">
        <div className="select-none text-center font-display text-[clamp(4rem,14vw,14rem)] font-bold leading-none tracking-tight text-ice/95">
          CLIPFORGE
        </div>
      </div>
    </footer>
  );
}

/* ---------- Shared CTA band ---------- */
export function CtaBand({
  title,
  body,
  clipperHref = "/login",
  brandHref = "/brand/request",
}: {
  title: string;
  body: string;
  clipperHref?: string;
  brandHref?: string;
}) {
  return (
    <section className="py-16">
      <div className="glass-dark glass-sheen glow-electric rounded-[2rem] p-10 text-center text-white md:p-14">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-ice/60">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={clipperHref}
            className="pill bg-electric px-7 py-3.5 font-bold text-white shadow-glow-electric hover:bg-electric-soft"
          >
            Start clipping
          </a>
          <a
            href={brandHref}
            className="pill border border-ice/25 px-7 py-3.5 font-bold text-ice/85 hover:bg-ice/10"
          >
            Start a campaign
          </a>
        </div>
      </div>
    </section>
  );
}
