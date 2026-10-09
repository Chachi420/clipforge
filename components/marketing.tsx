"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";

/* ---------- FAQ accordion ---------- */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-ink/15">
      {items.map((it, i) => (
        <div key={i} className="border-b border-ink/15">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-6 text-left"
            aria-expanded={open === i}
          >
            <span className="text-lg font-semibold text-ink md:text-xl">{it.q}</span>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-all duration-300 ${open === i ? "rotate-45 border-electric bg-electric text-white" : ""}`}>
              <Plus size={18} />
            </span>
          </button>
          <div className={`grid transition-all duration-300 ease-out ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <p className="max-w-xl pb-7 text-[15px] leading-relaxed text-ink-soft">{it.a}</p>
            </div>
          </div>
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
            <Link key={l.href} href={l.href} className="hover:text-ice">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-ice/40">© 2026 ClipForge. Pay per verified view.</div>
      </div>
      <div className="mt-12 overflow-hidden border-t border-ice/10 px-4 pt-8">
        <div className="select-none whitespace-nowrap text-center font-display text-[13.5vw] font-bold leading-none tracking-tight text-ice/95 md:text-[clamp(4rem,14vw,14rem)]">
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
