"use client";

import { useState } from "react";

const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "X"];

function fmt(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`
      : `${n}`;
}

export function EarningsCalculator() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [ratePer100k, setRatePer100k] = useState(50);
  const [viewsPerClip, setViewsPerClip] = useState(25_000);
  const [clipsPerMonth, setClipsPerMonth] = useState(20);

  const earnings = (viewsPerClip / 100_000) * ratePer100k * clipsPerMonth;
  const perClip = (viewsPerClip / 100_000) * ratePer100k;

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-base-850 p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-white/80">Platform</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                  platform === p ? "bg-accent text-white" : "border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-bold text-white/80">
            Campaign rate <span className="text-accent-soft">${ratePer100k} / 100K views</span>
          </label>
          <input
            type="range"
            min={10}
            max={300}
            step={5}
            value={ratePer100k}
            onChange={(e) => setRatePer100k(Number(e.target.value))}
            className="mt-3 w-full accent-accent"
          />
          <div className="mt-1 flex justify-between text-xs text-white/40">
            <span>$10</span>
            <span>$300</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-bold text-white/80">
            Avg. views per clip <span className="text-accent-soft">{fmt(viewsPerClip)}</span>
          </label>
          <input
            type="range"
            min={1_000}
            max={1_000_000}
            step={1_000}
            value={viewsPerClip}
            onChange={(e) => setViewsPerClip(Number(e.target.value))}
            className="mt-3 w-full accent-accent"
          />
          <div className="mt-1 flex justify-between text-xs text-white/40">
            <span>1K</span>
            <span>1M</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-bold text-white/80">
            Clips per month <span className="text-accent-soft">{clipsPerMonth}</span>
          </label>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={clipsPerMonth}
            onChange={(e) => setClipsPerMonth(Number(e.target.value))}
            className="mt-3 w-full accent-accent"
          />
          <div className="mt-1 flex justify-between text-xs text-white/40">
            <span>1</span>
            <span>100</span>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-base-950 p-6 text-center">
        <div className="text-sm font-semibold uppercase tracking-widest text-white/40">Estimated monthly earnings</div>
        <div className="mt-2 text-5xl font-black text-accent-soft">
          ${earnings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>
        <div className="mt-2 text-sm text-white/55">
          ≈ ${perClip.toLocaleString("en-US", { maximumFractionDigits: 2 })} per clip × {clipsPerMonth} clips
        </div>
        <p className="mx-auto mt-4 max-w-md text-xs text-white/40">
          Estimates only — actual earnings depend on campaign rates and verified views.
        </p>
      </div>
    </div>
  );
}
