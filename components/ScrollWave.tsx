"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/motion";

/**
 * Scroll-driven waveform divider — a nod to the Android music visualizer.
 * Bar energy follows scroll velocity: it dances while you scroll and
 * settles back to a hairline within a beat of stopping. The rAF loop only
 * runs while there is motion to draw, so it idles at zero cost otherwise.
 * Renders nothing under prefers-reduced-motion.
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
    };
    resize();
    window.addEventListener("resize", resize);

    const drawBars = (amplitude: number, alpha: number, phase: number) => {
      const n = Math.max(24, Math.floor(W / 14));
      const gap = W / n;
      const bw = Math.max(2, gap * 0.42);
      const mid = H / 2;
      for (let i = 0; i < n; i++) {
        const p = (i / n) * Math.PI * 4 + phase;
        const wobble =
          Math.sin(p) * 0.5 +
          Math.sin(p * 2.7 + 1.3) * 0.3 +
          Math.sin(p * 0.6) * 0.2;
        const h = Math.max(2, Math.min(H - 4, 2 + amplitude * (0.35 + 0.65 * Math.abs(wobble))));
        const x = i * gap + (gap - bw) / 2;
        ctx.fillStyle = `rgb(var(--ink) / ${alpha.toFixed(3)})`;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, mid - h / 2, bw, h, bw / 2);
        } else {
          ctx.rect(x, mid - h / 2, bw, h);
        }
        ctx.fill();
      }
    };

    const drawResting = () => {
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      ctx.fillStyle = "rgb(var(--ink) / 0.14)";
      ctx.fillRect(0, mid - 0.5, W, 1);
      // Quiet static waveform so the strip reads as "there" even at rest.
      drawBars(7, 0.16, 0.8);
    };

    const frame = () => {
      t += 1;
      const target = Math.min(1, Math.abs(vel) / 28);
      energy += (target - energy) * 0.14;
      vel *= 0.9;

      if (energy < 0.004 && Math.abs(vel) < 0.4) {
        running = false;
        drawResting();
        return;
      }

      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;

      ctx.fillStyle = "rgb(var(--ink) / 0.14)";
      ctx.fillRect(0, mid - 0.5, W, 1);

      drawBars(energy * H * 0.42, 0.1 + energy * 0.24, t * 0.09);

      raf = requestAnimationFrame(frame);
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
    drawResting();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      running = false;
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden className={`pointer-events-none w-full select-none ${className}`}>
      <canvas ref={canvasRef} className="block h-[72px] w-full" />
    </div>
  );
}
