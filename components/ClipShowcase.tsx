"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import type { ShowcaseClip } from "@/lib/showcase";

function compact(n: number): string {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/**
 * Horizontal, swipeable row of real clips in phone-shaped frames. A tap
 * swaps the thumbnail for the actual video (youtube-nocookie embed, loaded
 * only on demand so the page stays light).
 */
export default function ClipShowcase({ clips }: { clips: ShowcaseClip[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  if (clips.length === 0) return null;

  return (
    <ul className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 lg:-mx-10 lg:px-10 [scrollbar-width:thin]">
      {clips.map((clip) => {
        const isPlaying = playing === clip.id;
        return (
          <li key={clip.id} className="w-[62vw] max-w-[240px] shrink-0 snap-start sm:w-[220px]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] border border-line/10 bg-black shadow-[0_20px_40px_-20px_rgb(0_0_0/0.5)]">
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${clip.videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                  title={`Clip for ${clip.campaignName}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(clip.id)}
                  aria-label={`Play clip for ${clip.campaignName} (${compact(clip.views)} views)`}
                  className="group absolute inset-0 h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={clip.thumbUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="glass-btn h-14 w-14 !text-white">
                      <Play size={22} fill="currentColor" aria-hidden />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-4 text-left text-white">
                    <span className="tnum block text-2xl font-bold">{compact(clip.views)}</span>
                    <span className="block text-xs uppercase tracking-wider text-white/70">views</span>
                    <span className="mt-2 block truncate text-sm font-medium">{clip.campaignName}</span>
                  </span>
                </button>
              )}
            </div>
            <a
              href={clip.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm text-ink-soft hover:text-ink"
            >
              Watch on YouTube <ExternalLink size={13} aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
