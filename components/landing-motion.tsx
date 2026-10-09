"use client";

import { useEffect, useRef, useState } from "react";

/** Adds .in to .reveal elements when they enter the viewport. */
export function RevealInit() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}

/**
 * Vectr-style hero: the headline tilts away in 3D perspective + fades as you
 * scroll past it. Pure CSS transforms driven by scroll progress.
 */
export function HeroTilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        // progress: 0 when hero top hits viewport top, 1 when hero is half-scrolled
        const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.7)));
        el.style.transform = `perspective(1000px) rotateY(${-14 * p}deg) rotateX(${10 * p}deg) translateY(${-40 * p}px)`;
        el.style.opacity = String(1 - p * 0.9);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="will-change-transform" style={{ transformOrigin: "50% 0%" }}>
      {children}
    </div>
  );
}

/**
 * Pinned scroll-driven process (Vectr-style): steps advance purely by scrolling.
 * A tall track pins the card; scroll progress drives the active step + bar.
 * Numbered steps with thin dividers, electric blue accents.
 */
export function PinnedProcess({ steps, kicker = "How it works", title = "Three steps to your first payout" }: {
  steps: { n: string; title: string; body: string }[];
  kicker?: string;
  title?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
        setActive(Math.min(steps.length - 1, Math.floor(p * steps.length)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [steps.length]);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${120 + steps.length * 60}vh` }}>
      <div className="sticky top-0 flex min-h-screen items-center py-20">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="micro-label">{kicker}</div>
          <h2 className="display mt-4 text-4xl md:text-6xl">{title}</h2>
          {/* progress bar */}
          <div className="mt-10 h-px w-full bg-ink/15">
            <div
              className="h-px bg-electric transition-[width] duration-150"
              style={{ width: `${((active + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-2">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`grid grid-cols-[auto_1fr] gap-6 border-b border-line/10 py-8 transition-all duration-500 md:grid-cols-[120px_1fr_1fr] md:gap-10 ${
                  i === active ? "opacity-100" : i < active ? "opacity-60" : "opacity-30"
                }`}
              >
                <div className={`font-display text-lg font-bold tracking-tight ${i <= active ? "text-electric" : "text-ink-faint"}`}>
                  {s.n}
                </div>
                <div className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">{s.title}</div>
                <p className="col-span-2 max-w-md text-sm leading-relaxed text-ink-soft md:col-span-1">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="micro-label mt-8">
            {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
