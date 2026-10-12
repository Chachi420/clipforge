"use client";

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

/* ---------- Shared footer (brief \u00A79.3 \u2014 implementation lives in MarketingFooter.tsx) ---------- */
export { default as MarketingFooter } from "./MarketingFooter";
