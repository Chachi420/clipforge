import type { CSSProperties } from "react";
import type { ShowcaseBrand, ShowcaseClip } from "@/lib/showcase";

/** Repeat a short list so one copy is wider than the screen, then double
 *  it: the CSS loop slides exactly one copy (-50%) and restarts seamlessly. */
function loopItems<T>(items: T[], minPerCopy: number): T[] {
  if (items.length === 0) return [];
  const copy: T[] = [];
  while (copy.length < minPerCopy) copy.push(...items);
  return [...copy, ...copy];
}

function Monogram({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper"
    >
      {letters}
    </span>
  );
}

/**
 * Infinite, auto-scrolling strip of the brands running live campaigns.
 * Pauses on hover/focus; static and wrapped under reduced motion.
 */
export function BrandMarquee({
  brands,
  label = "Brands paying for views on Wondeed right now",
}: {
  brands: ShowcaseBrand[];
  label?: string;
}) {
  if (brands.length === 0) return null;
  const items = loopItems(brands, 10);
  const half = items.length / 2;
  return (
    <section aria-label={label} className="border-y border-line/10 bg-surface/60 py-8">
      <p className="micro-label mx-auto max-w-site px-6 text-center lg:px-10">{label}</p>
      <div className="marquee mt-6 overflow-hidden">
        <ul
          className="marquee-track gap-4"
          style={{ "--marquee-duration": `${Math.max(25, half * 4)}s` } as CSSProperties}
        >
          {items.map((b, i) => (
            <li
              key={`${b.name}-${i}`}
              aria-hidden={i >= half}
              className="glass flex shrink-0 items-center gap-3 rounded-full py-2 pl-2 pr-5"
            >
              {b.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logoUrl}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-full bg-paper object-cover"
                />
              ) : (
                <Monogram name={b.name} />
              )}
              <span className="whitespace-nowrap font-semibold text-ink">{b.name}</span>
              {b.ratePer100k ? (
                <span className="tnum whitespace-nowrap text-sm text-ink-faint">
                  ${b.ratePer100k.toLocaleString("en-US")}/100K
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Abstract tiles used when there are no real clips yet (demo, launch). */
const PLACEHOLDER_TONES = [
  "from-zinc-700 to-zinc-900",
  "from-neutral-600 to-neutral-900",
  "from-stone-600 to-stone-900",
  "from-slate-600 to-slate-900",
  "from-gray-600 to-gray-900",
];

/**
 * Decorative backdrop for the hero: columns of real clip thumbnails drifting
 * upward, dimmed under a gradient so text and glass buttons stay readable.
 * Purely visual (aria-hidden); falls back to abstract 9:16 tiles.
 */
export function ClipWall({ clips }: { clips: ShowcaseClip[] }) {
  const COLS = 6;
  const tiles: (ShowcaseClip | null)[] =
    clips.length >= 6 ? clips : Array.from({ length: 12 }, (_, i) => clips[i] ?? null);
  const columns = Array.from({ length: COLS }, (_, c) =>
    tiles.filter((_, i) => i % COLS === c).concat(tiles.filter((_, i) => (i + 2) % COLS === c))
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-[-4%] top-[-10%] flex h-[130%] justify-center gap-3 opacity-60 [transform:rotate(-6deg)] dark:opacity-45 sm:gap-4">
        {columns.map((col, c) => (
          <div
            key={c}
            className={`w-[30vw] max-w-[200px] shrink-0 sm:w-[16vw] ${c >= 4 ? "hidden md:block" : ""} ${c === 0 || c === 5 ? "hidden sm:block" : ""}`}
          >
            <div
              className="wall-col flex flex-col gap-3 sm:gap-4"
              style={
                {
                  "--wall-duration": `${70 + c * 9}s`,
                  animationDirection: c % 2 ? "reverse" : "normal",
                } as CSSProperties
              }
            >
              {[...col, ...col].map((clip, i) =>
                clip ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${clip.id}-${i}`}
                    src={clip.thumbUrl}
                    alt=""
                    loading={i < 3 ? "eager" : "lazy"}
                    className="aspect-[9/16] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    key={`ph-${c}-${i}`}
                    className={`aspect-[9/16] w-full rounded-2xl bg-gradient-to-b ${
                      PLACEHOLDER_TONES[(c + i) % PLACEHOLDER_TONES.length]
                    } opacity-40`}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Readability veil: strongest in the middle where the headline sits. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--paper)/0.92)_0%,rgb(var(--paper)/0.75)_45%,rgb(var(--paper)/0.35)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
    </div>
  );
}
