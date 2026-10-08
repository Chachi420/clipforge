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
 * K95-inspired lime glass orb — CSS only (layered radial gradients + blur),
 * slow float/rotate, subtle mouse parallax. Echoes the Bostie AI orb.
 */
export function Orb({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 24;
        const y = (e.clientY / window.innerHeight - 0.5) * 24;
        el.style.setProperty("--px", `${x}px`);
        el.style.setProperty("--py", `${y}px`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`orb-wrap ${className}`} aria-hidden>
      <div className="orb-core" />
      <div className="orb-glow" />
    </div>
  );
}

/**
 * Pinned scroll-driven process: steps advance purely by scrolling.
 * A tall track pins the card; scroll progress drives the active step + bar.
 */
export function PinnedProcess({ steps }: { steps: { n: string; title: string; body: string }[] }) {
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
        <div className="glass glass-sheen mx-auto w-full max-w-4xl rounded-[2rem] p-8 md:p-14">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-lime-deep">How it works</div>
          <h2 className="display mt-3 text-4xl md:text-5xl">Three steps to your first payout</h2>
          {/* progress bar */}
          <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-lime-deep transition-[width] duration-150"
              style={{ width: `${((active + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`rounded-3xl border p-6 transition-all duration-500 ${
                  i === active
                    ? "border-lime-deep/40 bg-lime-pale/60 shadow-glow-lime dark:bg-lime/10"
                    : i < active
                      ? "border-line/10 bg-surface/50 opacity-70"
                      : "border-line/10 bg-surface/50 opacity-40"
                }`}
              >
                <div className={`text-xs font-black tracking-widest ${i <= active ? "text-lime-deep" : "text-ink-faint"}`}>
                  {s.n}
                </div>
                <div className="mt-2 text-lg font-bold text-ink">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Keep scrolling — {active + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}
