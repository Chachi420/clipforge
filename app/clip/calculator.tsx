"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { CountUp } from "@/components/motion";

/** Slider-maximum earnings: 1M views/clip × $300/100K × 100 clips. */
const MAX_EARNINGS = 300_000;

const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "X"];

function fmt(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`
      : `${n}`;
}

/**
 * Earnings calculator — monochrome reskin. Same math, same sliders.
 * The rate is explicitly an example; the result is explicitly an estimate.
 */
export function EarningsCalculator() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [ratePer100k, setRatePer100k] = useState(50);
  const [viewsPerClip, setViewsPerClip] = useState(25_000);
  const [clipsPerMonth, setClipsPerMonth] = useState(20);

  const earnings = (viewsPerClip / 100_000) * ratePer100k * clipsPerMonth;
  const perClip = (viewsPerClip / 100_000) * ratePer100k;

  const sliderCls =
    "mt-3 w-full accent-ink";
  const valueCls = "font-semibold text-ink tnum";

  return (
    <Card className="mx-auto max-w-3xl p-6 md:p-10">
      <div className="grid gap-8 md:grid-cols-2">
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
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-ink">
            Example rate <span className={valueCls}>${ratePer100k} / 100K views</span>
          </label>
          <input
            type="range"
            min={10}
            max={300}
            step={5}
            value={ratePer100k}
            onChange={(e) => setRatePer100k(Number(e.target.value))}
            className={sliderCls}
            aria-label="Example rate per 100K views"
          />
          <div className="mt-1 flex justify-between text-xs text-ink-faint">
            <span>$10</span>
            <span>$300</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-ink">
            Avg. views per clip <span className={valueCls}>{fmt(viewsPerClip)}</span>
          </label>
          <input
            type="range"
            min={1_000}
            max={1_000_000}
            step={1_000}
            value={viewsPerClip}
            onChange={(e) => setViewsPerClip(Number(e.target.value))}
            className={sliderCls}
            aria-label="Average views per clip"
          />
          <div className="mt-1 flex justify-between text-xs text-ink-faint">
            <span>1K</span>
            <span>1M</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-ink">
            Clips per month <span className={valueCls}>{clipsPerMonth}</span>
          </label>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={clipsPerMonth}
            onChange={(e) => setClipsPerMonth(Number(e.target.value))}
            className={sliderCls}
            aria-label="Clips per month"
          />
          <div className="mt-1 flex justify-between text-xs text-ink-faint">
            <span>1</span>
            <span>100</span>
          </div>
        </div>
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
          <span>$300K — the slider maximums</span>
        </div>
        <div className="mt-2 text-sm text-white/60">
          ≈ ${perClip.toLocaleString("en-US", { maximumFractionDigits: 2 })} per clip ×{" "}
          {clipsPerMonth} clips
        </div>
        <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/40">
          Estimates only — actual earnings depend on campaign rates and verified views.
        </p>
      </div>
    </Card>
  );
}
