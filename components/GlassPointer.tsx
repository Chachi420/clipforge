"use client";

import { useEffect } from "react";

/**
 * Makes Liquid Glass buttons catch the light: while the pointer is over a
 * .glass-btn / .glass-btn-primary, its specular highlight follows the cursor
 * (CSS vars --gx/--gy). One delegated listener for the whole page; touch
 * and reduced-motion users keep the static top highlight.
 */
export default function GlassPointer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(".glass-btn, .glass-btn-primary") as HTMLElement | null;
      if (!el) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    };
    const onLeave = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(".glass-btn, .glass-btn-primary") as HTMLElement | null;
      if (el && !el.contains(e.relatedTarget as Node | null)) {
        el.style.removeProperty("--gx");
        el.style.removeProperty("--gy");
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);
  return null;
}
