"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/motion";

/**
 * "Now playing" waveform — Android music-player style, rendered in
 * shades of the theme itself, pinned directly below the menu bar.
 *
 * - Fill level = page scroll progress (played vs unplayed, like the
 *   player's seek bar), with a playhead dot.
 * - Amplitude = scroll velocity: the wave dances while you scroll and
 *   settles to a quiet static waveform when you stop.
 * - The rAF loop only runs while there is motion; otherwise idle at
 *   zero cost. pointer-events-none so it never blocks touches/clicks.
 * - Renders nothing under prefers-reduced-motion.
 *
 * NOTE: canvas fillStyle does NOT resolve CSS var() — so the theme ink
 * is read via getComputedStyle into real RGB numbers (and re-read when
 * the theme class changes). That is what makes the wave visible in
 * dark mode instead of falling back to invisible black.
 */
export function ScrollWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const wrapper = canvas.parentElement;
    if (!wrapper) return;

    // Theme ink as real RGB numbers — canvas cannot read var().
    let ink: [number, number, number] = [0, 0, 0];
    const readInk = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim();
      const parts = v.split(/[\s,]+/).map(Number);
      if (parts.length === 3 && parts.every(Number.isFinite)) {
        ink = [parts[0], parts[1], parts[2]];
      }
    };
    readInk();
    const inkObserver = new MutationObserver(readInk);
    inkObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const rgba = (a: number) => `rgba(${ink[0]},${ink[1]},${ink[2]},${a})`;

    // Park the strip directly below the menu bar (nav height is
    // content-driven, so measure it rather than guessing).
    const place = () => {
      const nav = document.querySelector('nav[aria-label="Primary"]');
      if (nav) {
        wrapper.style.top = `${Math.round(nav.getBoundingClientRect().height)}px`;
      }
    };
    place();

    let raf = 0;
    let running = false;
    let lastY = window.scrollY;
    let vel = 0;
    let energy = 0;
    let t = 0;
    let W = 0;
    let H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      place();
    };
    resize();
    window.addEventListener("resize", resize);

    const progress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    // Static envelope — gives the waveform its audio-like density variation.
    const envelope = (x: number) =>
      Math.max(
        0.12,
        0.42 +
          0.28 * Math.sin(x * 0.008 + 1.7) +
          0.18 * Math.sin(x * 0.021 + 0.4) +
          0.12 * Math.sin(x * 0.047 + 2.9)
      );

    const ampAt = (x: number, ampScale: number, phase: number) => {
      const osc =
        0.45 +
        0.55 *
          Math.abs(
            Math.sin(x * 0.045 + phase) * 0.6 +
              Math.sin(x * 0.012 - phase * 0.6) * 0.4
          );
      return Math.max(1.5, ampScale * envelope(x) * osc);
    };

    const buildPath = (ampScale: number, phase: number) => {
      const mid = H / 2;
      const cap = mid - 3;
      const step = 3;
      ctx.beginPath();
      for (let x = 0; x <= W; x += step) {
        const y = mid - Math.min(cap, ampAt(x, ampScale, phase));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let x = W; x >= 0; x -= step) {
        ctx.lineTo(x, mid + Math.min(cap, ampAt(x, ampScale, phase)));
      }
      ctx.closePath();
    };

    const draw = (ampScale: number, phase: number) => {
      const p = progress();
      const mid = H / 2;
      ctx.clearRect(0, 0, W, H);

      // Unplayed: full-width waveform, faint shade of the theme.
      buildPath(ampScale, phase);
      ctx.fillStyle = rgba(0.13);
      ctx.fill();

      // Played: clipped to scroll progress, stronger shade.
      if (p > 0.004) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, p * W, H);
        ctx.clip();
        buildPath(ampScale, phase);
        ctx.fillStyle = rgba(0.55);
        ctx.fill();
        ctx.restore();

        // Playhead dot, like the player's thumb.
        ctx.beginPath();
        ctx.arc(Math.min(W - 6, Math.max(6, p * W)), mid, 5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(0.9);
        ctx.fill();
      }
    };

    const frame = () => {
      t += 1;
      const target = Math.min(1, Math.abs(vel) / 30);
      energy += (target - energy) * 0.12;
      vel *= 0.9;
      draw(4 + energy * H * 0.38, t * 0.06);
      if (energy > 0.004 || Math.abs(vel) > 0.4) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        draw(4, 0.8); // settle to a quiet static wave
      }
    };

    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      vel = vel * 0.6 + (y - lastY) * 0.4;
      lastY = y;
      kick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    draw(4, 0.8);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      inkObserver.disconnect();
      cancelAnimationFrame(raf);
      running = false;
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-[68px] z-40 select-none bg-gradient-to-b from-paper/80 via-paper/30 to-transparent ${className}`}
    >
      <canvas ref={canvasRef} className="block h-16 w-full" />
    </div>
  );
}
