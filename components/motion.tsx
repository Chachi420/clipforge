"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Shared motion primitives (brief §13: 150ms micro, 250ms transitions, */
/* ease-out-expo). Everything respects prefers-reduced-motion — both   */
/* the CSS kill-switch in globals.css and these JS checks.             */
/* ------------------------------------------------------------------ */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Observe once: flips to true the first time the element enters view. */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion: never hide content waiting for a scroll trigger.
    if (reduced) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    // Safety net: if the observer never fires (throttled tab, odd mobile
    // browser), never leave content permanently invisible — a stuck reveal
    // reads as a blank gap on the page.
    const fallback = window.setTimeout(() => {
      setInView(true);
      io.disconnect();
    }, 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [reduced, threshold]);

  return { ref, inView };
}

type RevealTag = "div" | "section" | "li" | "span" | "p" | "h1" | "h2" | "ul";

/**
 * Fade + rise on scroll into view. Stagger siblings with `delay`.
 * Above-the-fold usage doubles as a (fast, 250ms) entrance animation.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: RevealTag;
  id?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      id,
      className: `reveal${inView ? " in" : ""}${className ? ` ${className}` : ""}`,
      ...(delay > 0 ? { style: { transitionDelay: `${delay}ms` } } : {}),
    },
    children
  );
}

/**
 * Animates a number from its previous value to `value` when visible.
 * Re-animates on value change (drives the calculator's live figure).
 * Always tabular-nums; static final value under reduced motion.
 */
const FORMATS: Record<string, (n: number) => string> = {
  int: (n) => Math.round(n).toLocaleString("en-US"),
  usd: (n) => `$${Math.round(n).toLocaleString("en-US")}`,
  usd2: (n) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
};

export function CountUp({
  value,
  format = "int",
  className = "",
}: {
  value: number;
  format?: keyof typeof FORMATS;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    if (reduced) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }
    let raf = 0;
    const start = performance.now();
    // Duration scales with the size of the jump; slider drags stay snappy.
    const duration = Math.min(700, 250 + (Math.abs(to - from) / Math.max(1, Math.abs(to))) * 450);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      fromRef.current = current;
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className={`tnum${className ? ` ${className}` : ""}`}>
      {FORMATS[format](display)}
    </span>
  );
}
