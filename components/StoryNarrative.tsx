"use client";

/**
 * StoryNarrative — the ClipForge story as pure typography.
 *
 * Replaces the WebGL Flywheel: a pinned scroll narrative where massive
 * Fraunces numerals + headlines carry each chapter. One signature idea
 * (the 4-step story), executed with restraint.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CHAPTERS = [
  {
    n: "01",
    kicker: "The Brief",
    title: "A brand posts what it'll pay per view",
    body: "No pitch decks, no DMs, no \u2018let\u2019s hop on a call.\u2019 A brand sets a rate, caps the budget, and the brief goes live. You decide if the math works for you.",
  },
  {
    n: "02",
    kicker: "The Clips",
    title: "You post. Your account, your style",
    body: "Grab the brief, cut the best 30 seconds, post it where your audience already is. Zero followers? Doesn't matter — a good clip earns from view one.",
  },
  {
    n: "03",
    kicker: "The Views",
    title: "Every view gets counted — for real",
    body: "We pull numbers straight from the platform, strip out the bots, and humans spot-check the rest. If a view didn't happen, nobody pays for it.",
  },
  {
    n: "04",
    kicker: "The Payout",
    title: "Views turn into money. Weekly",
    body: "When the cycle closes, your verified views become a payout. Then you pick the next brief and do it again. That's the whole flywheel.",
  },
];

function chapterOf(p: number): number {
  if (p < 0.25) return 1;
  if (p < 0.5) return 2;
  if (p < 0.75) return 3;
  return 4;
}

export default function StoryNarrative() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = Math.max(1, r.height - window.innerHeight);
        const p = Math.min(1, Math.max(0, -r.top / total));
        setProgress(p);
        setChapter(chapterOf(p));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goToChapter = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    // chapter i (1-4) sits at roughly ((i - 0.5) * 0.25) of the track
    const frac = Math.min(0.95, (i - 0.5) * 0.25);
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + frac * total, behavior: "smooth" });
  };

  return (
    <div ref={trackRef} className="relative" style={{ height: "400vh" }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* giant background numeral — the chapter's anchor */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {CHAPTERS.map((c, i) => {
            const id = i + 1;
            const active = chapter === id;
            // parallax drift driven by overall progress
            const drift = (progress - (i + 0.5) * 0.25) * 120;
            return (
              <div
                key={c.n}
                className={`display absolute select-none text-[38vw] leading-none text-ink/[0.045] transition-opacity duration-700 md:text-[28vw] dark:text-paper/[0.05] ${
                  active ? "opacity-100" : "opacity-0"
                }`}
                style={{ transform: `translateY(${-drift}px)` }}
              >
                {c.n}
              </div>
            );
          })}
        </div>

        {/* chapter content */}
        <div className="relative mx-auto w-full max-w-6xl px-6">
          {CHAPTERS.map((c, i) => {
            const id = i + 1;
            const active = chapter === id;
            return (
              <div
                key={c.n}
                className={`absolute inset-y-0 left-6 right-6 flex items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-12 opacity-0"
                }`}
                aria-hidden={!active}
              >
                <div className="max-w-3xl">
                  <div className="micro-label">{c.kicker}</div>
                  <h2 className="display mt-5 text-[clamp(2rem,8vw,5.5rem)] leading-[1.05] hyphens-none [text-wrap:balance]">
                    {c.title}
                  </h2>
                  <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-soft">{c.body}</p>
                  {id === 4 && (
                    <Link
                      href="/login"
                      className="pill mt-8 inline-flex items-center gap-2 bg-electric px-8 py-4 font-semibold text-white shadow-[0_4px_20px_rgb(32_71_255/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1A3BDB]"
                    >
                      Start clipping <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
          {/* spacer to give absolute children height */}
          <div className="invisible max-w-3xl">
            <div className="micro-label">.</div>
            <h2 className="display mt-5 text-[clamp(2rem,8vw,5.5rem)] leading-[1.05]">.</h2>
            <p className="mt-6 max-w-lg text-[17px]">.</p>
          </div>
        </div>

        {/* progress: counter + bar + dots */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4">
          <span className="micro-label tabular-nums">
            {String(chapter).padStart(2, "0")} / 04
          </span>
          <div className="h-px w-24 overflow-hidden rounded-full bg-ink/15 md:w-32">
            <div
              className="h-full w-full origin-left bg-electric transition-transform duration-150"
              style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }}
            />
          </div>
        </div>
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToChapter(i)}
              aria-label={`Go to chapter ${i}`}
              className="group flex cursor-pointer items-center justify-end gap-2.5 px-2 py-1.5"
            >
              <span className={`micro-label transition-colors ${chapter === i ? "text-ink" : "text-ink-faint group-hover:text-ink-soft"}`}>
                0{i}
              </span>
              <span className={`h-2 w-2 rounded-full transition-all ${chapter === i ? "scale-125 bg-electric" : "bg-ink/25 group-hover:bg-ink/50"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
