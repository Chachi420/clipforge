"use client";

import {
  Briefcase,
  Clapperboard,
  Megaphone,
  ShieldCheck,
  Wallet,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "@/components/motion";

/* ------------------------------------------------------------------ */
/* Explanatory infographics — inline, monochrome, genuinely            */
/* explanatory. No invented stats; everything shown is either the      */
/* documented product mechanism or labeled Illustrative.               */
/* ------------------------------------------------------------------ */

type Node = { icon: LucideIcon; title: string; body: string };

const FLOW_NODES: Node[] = [
  {
    icon: Briefcase,
    title: "Brand",
    body: "Sets the budget and the per-view rate.",
  },
  {
    icon: Megaphone,
    title: "Campaign",
    body: "The brief goes live for clippers.",
  },
  {
    icon: Clapperboard,
    title: "Clipper",
    body: "Posts clips to their own accounts.",
  },
  {
    icon: ShieldCheck,
    title: "Verification",
    body: "Views are pulled from the platforms and checked.",
  },
  {
    icon: Wallet,
    title: "Payout",
    body: "Monthly payout via PayPal or crypto.",
  },
];

/**
 * Money-flow diagram — the documented path money takes through
 * ClipForge. Horizontal on desktop, vertical on mobile; the connector
 * line draws itself when scrolled into view.
 */
export function MoneyFlowDiagram() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className="relative mt-14">
      {/* Connector — desktop horizontal */}
      <div
        aria-hidden
        className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-white/15 md:block"
      />
      <div
        aria-hidden
        className={`absolute left-[10%] right-[10%] top-7 hidden h-px origin-left bg-white transition-transform duration-1000 ease-smooth md:block ${
          inView ? "scale-x-100" : "scale-x-0"
        }`}
      />
      {/* Connector — mobile vertical */}
      <div
        aria-hidden
        className="absolute bottom-8 left-7 top-8 w-px bg-white/15 md:hidden"
      />
      <div
        aria-hidden
        className={`absolute bottom-8 left-7 top-8 w-px origin-top bg-white transition-transform duration-1000 ease-smooth md:hidden ${
          inView ? "scale-y-100" : "scale-y-0"
        }`}
      />

      <ol className="relative grid gap-10 md:grid-cols-5 md:gap-4">
        {FLOW_NODES.map((n, i) => (
          <li
            key={n.title}
            className={`reveal${inView ? " in" : ""}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <div className="flex items-center gap-5 md:flex-col md:gap-0 md:text-center">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black text-white">
                <n.icon size={22} aria-hidden />
              </span>
              <div className="md:mt-5">
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <p className="mt-1 max-w-[16rem] text-sm leading-relaxed text-white/60 md:mx-auto">
                  {n.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-center text-xs text-white/40">
        How the money moves — the actual mechanism, not a metaphor.
      </p>
    </div>
  );
}

const CYCLE_STAGES: (Node & { when: string })[] = [
  {
    icon: Clapperboard,
    title: "Post all month",
    body: "Every clip you post accrues verified views, day by day.",
    when: "Days 2–31",
  },
  {
    icon: Clock,
    title: "Cycle closes",
    body: "Views are snapshotted. Nothing you need to do.",
    when: "1st · 03:00 UTC",
  },
  {
    icon: ShieldCheck,
    title: "Admin review",
    body: "Every payout is reviewed before money moves.",
    when: "After close",
  },
  {
    icon: Wallet,
    title: "Payout",
    body: "To your PayPal or crypto wallet.",
    when: "After review",
  },
];

/**
 * Monthly cycle timeline. The "today" marker and month progress are
 * computed from the real date — honest, not illustrative. Stage
 * timings come from the documented payout process.
 */
export function CycleTimeline() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const now = new Date();
  const day = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const pct = Math.min(100, Math.max(2, (day / daysInMonth) * 100));
  const isCloseDay = day === 1;
  const activeIndex = isCloseDay ? 1 : 0;
  // Keep the "Today" marker inside the bar at the month's edges.
  const markerLeft = `clamp(12px, ${pct}%, calc(100% - 12px))`;

  return (
    <div ref={ref}>
      {/* Month progress */}
      <div
        className={`reveal${inView ? " in" : ""}`}
        role="img"
        aria-label={`Today is day ${day} of ${daysInMonth} this month.`}
      >
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-ink tnum">
            Day {day} of {daysInMonth}
          </span>
          <span className="text-xs text-ink-faint">Live — based on today&apos;s date</span>
        </div>
        <div className="relative mt-3 h-2 overflow-visible rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-ink transition-all duration-1000 ease-smooth"
            style={{ width: inView ? `${pct}%` : "0%" }}
          />
          {/* Today marker */}
          <div
            className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-paper bg-ink transition-all duration-1000 ease-smooth"
            style={{ left: inView ? markerLeft : "12px" }}
            aria-hidden
          />
          <span
            className="absolute -top-7 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint transition-all duration-1000 ease-smooth"
            style={{ left: inView ? markerLeft : "12px" }}
            aria-hidden
          >
            Today
          </span>
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-faint">
          <span>1st — cycle closes</span>
          <span>
            Next close: 1st of{" "}
            {new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString("en-US", {
              month: "long",
            })}
          </span>
        </div>
      </div>

      {/* Stages */}
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CYCLE_STAGES.map((s, i) => {
          const active = i === activeIndex;
          return (
            <li
              key={s.title}
              className={`reveal${inView ? " in" : ""} rounded-card border p-5 ${
                active ? "border-ink bg-surface" : "border-line/10"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
              aria-current={active ? "step" : undefined}
            >
              <div className="flex items-center justify-between">
                <s.icon size={20} className="text-ink" aria-hidden />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  {s.when}
                </span>
              </div>
              <p className="mt-4 font-semibold text-ink">
                {s.title}
                {active && (
                  <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper">
                    Now
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-center text-xs text-ink-faint">
        The monthly rhythm, exactly as it runs — no estimates, no maybe-dates.
      </p>
    </div>
  );
}
