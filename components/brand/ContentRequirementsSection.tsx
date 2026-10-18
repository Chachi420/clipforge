"use client";

import { Field } from "@/components/ui";

export const PROMO_FORMATS = [
  { value: "video", label: "Video clip", hint: "Clipper cuts/edits video featuring your brand" },
  { value: "logo_overlay", label: "Logo overlay", hint: "Your logo appears as watermark/overlay" },
  { value: "banner", label: "Banner / cover", hint: "Branded banner or cover frame on the clip" },
  { value: "voiceover", label: "Voiceover mention", hint: "Clipper mentions your brand in audio" },
  { value: "caption", label: "Caption + hashtags", hint: "Brand mention in caption/text only" },
] as const;

export const ASPECT_RATIOS = [
  { value: "9:16", label: "9:16 Vertical" },
  { value: "16:9", label: "16:9 Horizontal" },
  { value: "1:1", label: "1:1 Square" },
] as const;

export interface ContentRequirementsState {
  promoFormats: string[];
  aspectRatios: string[];
  minDurationSec: string;
  maxDurationSec: string;
  requiredHashtags: string;
  requiredTags: string;
  sourceMaterialUrl: string;
  minClipsExpected: string;
  requiresPreapproval: boolean;
}

export const emptyContentRequirements: ContentRequirementsState = {
  promoFormats: ["video"],
  aspectRatios: ["9:16"],
  minDurationSec: "",
  maxDurationSec: "",
  requiredHashtags: "",
  requiredTags: "",
  sourceMaterialUrl: "",
  minClipsExpected: "1",
  requiresPreapproval: false,
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-electric-deep/60 bg-electric/20 text-ink"
          : "border-line/10 bg-surface text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function ContentRequirementsSection({
  value,
  onChange,
}: {
  value: ContentRequirementsState;
  onChange: (v: ContentRequirementsState) => void;
}) {
  const set = (patch: Partial<ContentRequirementsState>) => onChange({ ...value, ...patch });

  function toggle(list: string[], v: string) {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-ink">Content requirements</h3>
        <p className="mt-0.5 text-xs text-ink-faint">
          Tell clippers exactly what to make — clearer briefs get better clips.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Field label="Promotion format">
            <div className="flex flex-wrap gap-2">
              {PROMO_FORMATS.map((f) => (
                <Chip
                  key={f.value}
                  active={value.promoFormats.includes(f.value)}
                  onClick={() => set({ promoFormats: toggle(value.promoFormats, f.value) })}
                >
                  {f.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Aspect ratio">
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((r) => (
                <Chip
                  key={r.value}
                  active={value.aspectRatios.includes(r.value)}
                  onClick={() => set({ aspectRatios: toggle(value.aspectRatios, r.value) })}
                >
                  {r.label}
                </Chip>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Min length (sec)">
              <input
                type="number"
                min="0"
                value={value.minDurationSec}
                onChange={(e) => set({ minDurationSec: e.target.value })}
                placeholder="No min"
                className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
              />
            </Field>
            <Field label="Max length (sec)">
              <input
                type="number"
                min="0"
                value={value.maxDurationSec}
                onChange={(e) => set({ maxDurationSec: e.target.value })}
                placeholder="No max"
                className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
              />
            </Field>
            <Field label="Min clips expected">
              <input
                type="number"
                min="1"
                value={value.minClipsExpected}
                onChange={(e) => set({ minClipsExpected: e.target.value })}
                className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Required hashtags">
              <input
                type="text"
                value={value.requiredHashtags}
                onChange={(e) => set({ requiredHashtags: e.target.value })}
                placeholder="#yourbrand, #campaign"
                className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
              />
            </Field>
            <Field label="Accounts to tag">
              <input
                type="text"
                value={value.requiredTags}
                onChange={(e) => set({ requiredTags: e.target.value })}
                placeholder="@yourbrand"
                className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
              />
            </Field>
          </div>

          <Field label="Source material (optional)">
            <input
              type="url"
              value={value.sourceMaterialUrl}
              onChange={(e) => set({ sourceMaterialUrl: e.target.value })}
              placeholder="Drive / YouTube / Dropbox link to content clippers should use"
              className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/10 bg-surface p-4">
            <input
              type="checkbox"
              checked={value.requiresPreapproval}
              onChange={(e) => set({ requiresPreapproval: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-ink"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">Review clips before they go live</span>
              <span className="mt-0.5 block text-xs text-ink-soft">
                Clippers submit drafts for your approval before posting. Slower, but full control.
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
