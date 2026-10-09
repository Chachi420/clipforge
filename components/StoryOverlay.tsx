"use client";

/**
 * StoryOverlay — the HTML half of the ClipForge Flywheel story.
 *
 * Chapter text crossfades per scroll chapter (driven by StoryScene's chapter
 * state); chapter 0 is the hero headline with a scroll-driven 3D tilt.
 * Includes clickable chapter dots, a cursor tooltip for 3D hovers, and
 * magnetic CTA buttons. All pointer-events are scoped so the WebGL canvas
 * beneath stays interactive.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

export interface HoverInfo {
  label: string;
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ */
/* magnetic hover — element leans toward the cursor                     */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  className = "",
  strength = 7,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${(dx / r.width) * strength * 2}px, ${(dy / r.height) * strength * 2}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block transition-transform duration-150 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* chapter 0 hero — tilt + fade driven by story progress (no re-render) */
/* ------------------------------------------------------------------ */
function HeroHeadline({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      const el = ref.current;
      if (!el) return;
      const p = Math.min(1, Math.max(0, progressRef.current / 0.15));
      el.style.transform = `perspective(1000px) rotateY(${-10 * p}deg) rotateX(${7 * p}deg) translateY(${-36 * p}px)`;
      el.style.opacity = String(1 - p * 0.9);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [progressRef]);

  return (
    <div ref={ref} className="will-change-transform" style={{ transformOrigin: "50% 0%" }}>
      <div className="micro-label mb-6">Clip · Post · Get Paid</div>
      <h1 className="display text-[clamp(3rem,7vw,5.5rem)] leading-[1.02]">
        Clip. Post.
        <br />
        Get Paid.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
        Brands run pay-per-view campaigns. Clippers earn for every verified view. No following required.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        <Magnetic>
          <Link href="/login" className="pill pointer-events-auto inline-flex items-center gap-2 bg-electric px-8 py-4 font-semibold text-white shadow-[0_4px_20px_rgb(32_71_255/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1A3BDB] hover:shadow-[0_10px_32px_rgb(32_71_255/0.45)]">
            Start clipping <ArrowRight size={18} />
          </Link>
        </Magnetic>
        <Link href="/brands" className="link-under pointer-events-auto inline-flex items-center gap-1.5 font-semibold text-ink transition-colors hover:text-electric-deep">
          I&apos;m a brand <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* chapters                                                            */
/* ------------------------------------------------------------------ */
const CHAPTERS = [
  {
    n: "01",
    kicker: "01 — The Brief",
    title: "Brands post pay-per-view campaigns",
    body: "Set a rate per 100K views, pick the platforms, cap the budget. The brief goes live to the clipper network — no media buying, no guesswork.",
  },
  {
    n: "02",
    kicker: "02 — The Clips",
    title: "Clippers grab the brief and post",
    body: "Thousands of clippers cut the best moments and post to their own channels. No following required — the clip does the work.",
  },
  {
    n: "03",
    kicker: "03 — The Views",
    title: "Every verified view is tracked live",
    body: "View counts are pulled straight from the platforms, filtered for bots, spot-checked by hand. Nothing faked, ever.",
  },
  {
    n: "04",
    kicker: "04 — The Payout",
    title: "Views convert to earnings",
    body: "When the cycle closes, verified views become payouts — sent weekly. Then the flywheel spins again.",
  },
];

function ChapterBlock({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 flex items-center transition-all duration-700 ease-out ${
        active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-10 opacity-0"
      }`}
      aria-hidden={!active}
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* chapter progress bar — thin fill driven by story progress           */
/* ------------------------------------------------------------------ */
function ChapterProgress({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      const el = ref.current;
      if (!el) return;
      // progress across chapters 1–4 (0.15 → 1.0 of story)
      const p = Math.min(1, Math.max(0, (progressRef.current - 0.15) / 0.85));
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [progressRef]);

  return <div ref={ref} className="h-full w-full origin-left bg-electric" style={{ transform: "scaleX(0)" }} />;
}

/* ------------------------------------------------------------------ */
/* overlay                                                             */
/* ------------------------------------------------------------------ */
export default function StoryOverlay({
  chapter,
  hover,
  goToChapter,
  progressRef,
}: {
  chapter: number;
  hover: HoverInfo | null;
  goToChapter: (i: number) => void;
  progressRef: React.MutableRefObject<number>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* chapter 0 — hero */}
      <div
        className={`absolute inset-0 flex items-center transition-all duration-700 ${
          chapter === 0 ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* ambient glow — dark mode depth without 3D clutter */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 hidden h-[60vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl dark:block"
          style={{ background: "radial-gradient(closest-side, rgba(32,71,255,0.16), transparent)" }}
        />
        <div className="relative w-full px-6 text-center">
          <HeroHeadline progressRef={progressRef} />
        </div>
      </div>
      {/* scroll cue */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
          chapter === 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="glass micro-label animate-bounce rounded-full px-5 py-2">Scroll</div>
      </div>

      {/* chapters 1–4 */}
      {CHAPTERS.map((c, i) => {
        const id = i + 1;
        const active = chapter === id;
        return (
          <ChapterBlock key={c.n} active={active}>
            <div className="micro-label">{c.kicker}</div>
            <h2 className="display mt-4 text-4xl md:text-[3.5rem] md:leading-[1.05]">{c.title}</h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">{c.body}</p>
            {id === 4 && (
              <div className="mt-8">
                <Magnetic>
                  <Link href="/login" className="pill pointer-events-auto inline-flex items-center gap-2 bg-electric px-8 py-4 font-semibold text-white shadow-[0_4px_20px_rgb(32_71_255/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1A3BDB]">
                    Start clipping <ArrowRight size={18} />
                  </Link>
                </Magnetic>
              </div>
            )}
          </ChapterBlock>
        );
      })}

      {/* chapter progress — counter + thin bar (mobile-visible, Apple-style wayfinding) */}
      <div
        className={`absolute bottom-8 right-5 flex items-center gap-3 transition-opacity duration-500 md:right-8 ${
          chapter === 0 ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="micro-label tabular-nums">
          {String(chapter).padStart(2, "0")} / 04
        </span>
        <div className="h-px w-16 overflow-hidden rounded-full bg-ink/15 md:w-24">
          <ChapterProgress progressRef={progressRef} />
        </div>
      </div>
      <div
        className={`pointer-events-auto absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer flex-col gap-4 transition-opacity duration-500 md:flex ${
          chapter === 0 ? "opacity-0" : "opacity-100"
        }`}
      >
        {[1, 2, 3, 4].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToChapter(i)}
            onPointerDown={(e) => {
              // pointerdown is more reliable than click under a live canvas
              if (e.pointerType === "mouse") goToChapter(i);
            }}
            aria-label={`Go to chapter ${i}`}
            className="group flex cursor-pointer items-center justify-end gap-2.5 px-2 py-2"
          >
            <span className={`micro-label transition-colors ${chapter === i ? "text-electric-deep" : "text-ink-faint group-hover:text-ink-soft"}`}>
              0{i}
            </span>
            <span
              className={`h-2 w-2 rounded-full transition-all ${
                chapter === i ? "scale-125 bg-electric" : "bg-ink/25 group-hover:bg-ink/50"
              }`}
            />
          </button>
        ))}
      </div>

      {/* 3D hover tooltip */}
      {hover && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2" style={{ left: hover.x, top: Math.max(8, hover.y - 64) }}>
          <div className="glass rounded-xl px-3.5 py-2 text-center shadow-xl">
            <div className="whitespace-nowrap text-xs font-bold text-ink">{hover.label}</div>
            <div className="micro-label mt-0.5 text-ink-faint">illustrative</div>
          </div>
        </div>
      )}
    </div>
  );
}
