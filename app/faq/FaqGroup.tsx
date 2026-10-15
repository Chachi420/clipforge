"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function FaqGroup({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section aria-label={title}>
      <h2 className="display text-2xl md:text-3xl">{title}</h2>
      <div className="mt-6 border-t border-ink/15">
        {items.map((it, i) => (
          <div key={i} className="border-b border-ink/15">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex min-h-[64px] w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open === i}
            >
              <span className="text-base font-semibold text-ink md:text-lg">{it.q}</span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-all duration-300 ${
                  open === i ? "rotate-45 border-ink bg-ink text-paper" : ""
                }`}
                aria-hidden="true"
              >
                <Plus size={16} />
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 text-sm leading-relaxed text-ink-soft md:text-[15px]">
                  {it.a}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
