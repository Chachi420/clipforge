"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { CountUp } from "@/components/motion";

/** Slider-maximum earnings (gross, before per-campaign platform fee): 1M views/clip × $300/100K × 100 clips. */
const MAX_EARNINGS = 240_000;

const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "X"];

function fmt(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`
      : `${n}`;
}

/**
 * Full-width slider with a filled track. `fillPct` is 0–100 and drives the
 * monochrome fill via an inline gradient (theme-aware through --ink).
 */
function Slider({
  label,
  display,
  min,
  max,
  step,
  value,
  minLabel,
  maxLabel,
  onChange,
  ariaLabel,
}: {
  label: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  minLabel: string;
  maxLabel: string;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="display shrink-0 text-xl text-ink tnum">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider mt-4 w-full"
        style={{
          background: `linear-gradient(to right, rgb(var(--ink)) 0%, rgb(var(--ink)) ${pct}%, rgb(var(--ink) / 0.14) ${pct}%, rgb(var(--ink) / 0.14) 100%)`,
        }}
        aria-label={ariaLabel}
      />
      <div className="mt-2 flex justify-between text-xs text-ink-faint tnum">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

/**
 * Earnings calculator — monochrome reskin. Same math, same sliders.
 * The rate is explicitly an example; the result is explicitly an estimate.
 * Views slider is logarithmic (1K–1M) so the whole track stays useful.
 */
export function EarningsCalculator() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [ratePer100k, setRatePer100k] = useState(50);
  // log10 of views: 3 → 1K, 6 → 1M
  const [viewsExp, setViewsExp] = useState(Math.log10(25_000));
  const [clipsPerMonth, setClipsPerMonth] = useState(20);

  const viewsPerClip = Math.round(Math.pow(10, viewsExp) / 1000) * 1000;
  // Gross estimate — ClipForge's platform fee is set per campaign, so the
  // dashboard shows each clipper's net. Keep the calculator honest: no take applied.
  const earnings = (viewsPerClip / 100_000) * ratePer100k * clipsPerMonth;
  const perClip = (viewsPerClip / 100_000) * ratePer100k;

  return (
    <Card className="p-6 md:p-8">
      <div>
        <span className="text-sm font-semibold text-ink" id="calc-platform">
          Platform
        </span>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="calc-platform">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              aria-pressed={platform === p}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-micro ${
                platform === p
                  ? "bg-ink text-paper"
                  : "border border-line/15 text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-7">
        <Slider
          label="Example rate"
          display={`$${ratePer100k} / 100K views`}
          min={10}
          max={300}
          step={5}
          value={ratePer100k}
          minLabel="$10"
          maxLabel="$300"
          onChange={setRatePer100k}
          ariaLabel="Example rate per 100K views"
        />
        <Slider
          label="Avg. views per clip"
          display={fmt(viewsPerClip)}
          min={3}
          max={6}
          step={0.01}
          value={viewsExp}
          minLabel="1K"
          maxLabel="1M"
          onChange={setViewsExp}
          ariaLabel="Average views per clip"
        />
        <Slider
          label="Clips per month"
          display={`${clipsPerMonth}`}
          min={1}
          max={100}
          step={1}
          value={clipsPerMonth}
          minLabel="1"
          maxLabel="100"
          onChange={setClipsPerMonth}
          ariaLabel="Clips per month"
        />
      </div>

      <div className="mt-8 rounded-card border border-white/10 bg-black p-6 text-center text-white md:p-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Estimated monthly earnings
        </div>
        <div className="display mt-3 text-5xl text-white md:text-6xl">
          <CountUp
            value={earnings}
            format="usd"
          />
        </div>
        {/* Scale bar — width is earnings as a share of the slider maximums */}
        <div
          className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-white/10"
          role="img"
          aria-label={`Estimated $${Math.round(earnings).toLocaleString()} of a $${MAX_EARNINGS.toLocaleString()} slider-maximum`}
        >
          <div
            className="h-full rounded-full bg-white transition-all duration-300 ease-smooth"
            style={{ width: `${Math.max(2, Math.min(100, (earnings / MAX_EARNINGS) * 100))}%` }}
            aria-hidden
          />
        </div>
        <div className="mx-auto mt-2 flex max-w-md justify-between text-[11px] text-white/40 tnum">
          <span>$0</span>
          <span>$240K — the slider maximums</span>
        </div>
        <div className="mt-2 text-sm text-white/60">
          ≈ ${perClip.toLocaleString("en-US", { maximumFractionDigits: 2 })} per clip ×{" "}
          {clipsPerMonth} clips
        </div>
        <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/40">
          Estimates only, before ClipForge&apos;s platform fee (set per campaign) — actual earnings depend on campaign rates and verified views.
        </p>
      </div>
    </Card>
  );
}
