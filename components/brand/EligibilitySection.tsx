"use client";

import { Field, inputCls } from "@/components/ui";
import {
  ELIGIBILITY_LABELS,
  ELIGIBILITY_DESCRIPTIONS,
  type EligibilityType,
  type RateTier,
} from "@/lib/types";

const OPTIONS: EligibilityType[] = ["open", "followers", "engagement", "invite_only"];

export interface EligibilityState {
  type: EligibilityType;
  minFollowers: string;
  minAvgViews: string;
  rateTiers: RateTier[];
}

export const emptyEligibility: EligibilityState = {
  type: "open",
  minFollowers: "",
  minAvgViews: "",
  rateTiers: [],
};

/**
 * Eligibility + rate tiers editor. Controlled: parent owns the state.
 * Used in both the campaign creation form and the settings edit form.
 */
export default function EligibilitySection({
  value,
  onChange,
}: {
  value: EligibilityState;
  onChange: (v: EligibilityState) => void;
}) {
  function set(patch: Partial<EligibilityState>) {
    onChange({ ...value, ...patch });
  }

  function addTier() {
    set({ rateTiers: [...value.rateTiers, { minFollowers: 10000, multiplier: 1.5 }] });
  }

  function updateTier(i: number, patch: Partial<RateTier>) {
    const tiers = value.rateTiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    set({ rateTiers: tiers });
  }

  function removeTier(i: number) {
    set({ rateTiers: value.rateTiers.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-5">
      <Field label="Who can join this campaign?">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => set({ type: opt })}
              aria-pressed={value.type === opt}
              className={`rounded-xl border p-3 text-left transition ${
                value.type === opt
                  ? "border-ink bg-ink text-paper"
                  : "border-line/10 bg-surface text-ink hover:border-ink/40"
              }`}
            >
              <span className="block text-sm font-semibold">{ELIGIBILITY_LABELS[opt]}</span>
              <span
                className={`mt-0.5 block text-xs ${
                  value.type === opt ? "text-paper/70" : "text-ink-faint"
                }`}
              >
                {ELIGIBILITY_DESCRIPTIONS[opt]}
              </span>
            </button>
          ))}
        </div>
      </Field>

      {value.type === "followers" && (
        <Field label="Minimum followers (on a verified account)">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="1"
            value={value.minFollowers}
            onChange={(e) => set({ minFollowers: e.target.value })}
            placeholder="e.g. 5000"
          />
        </Field>
      )}

      {value.type === "engagement" && (
        <Field label="Minimum average views (on a verified account)">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="1"
            value={value.minAvgViews}
            onChange={(e) => set({ minAvgViews: e.target.value })}
            placeholder="e.g. 10000"
          />
        </Field>
      )}

      {value.type === "invite_only" && (
        <p className="rounded-md bg-ink/5 px-4 py-2.5 text-sm text-ink-soft">
          Only clippers you invite can join. Manage invites from the Invites tab after
          creating the campaign.
        </p>
      )}

      {/* Rate tiers */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Rate tiers <span className="font-normal normal-case">(optional)</span>
          </span>
          <button
            type="button"
            onClick={addTier}
            className="text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            + Add tier
          </button>
        </div>
        <p className="mb-3 text-xs text-ink-faint">
          Pay bigger accounts more. Clippers with at least X followers earn the base rate ×
          multiplier.
        </p>
        {value.rateTiers.length === 0 ? (
          <p className="rounded-md border border-dashed border-line/20 px-4 py-3 text-sm text-ink-faint">
            No tiers — everyone earns the base rate.
          </p>
        ) : (
          <div className="space-y-2">
            {value.rateTiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="1"
                  value={tier.minFollowers}
                  onChange={(e) =>
                    updateTier(i, { minFollowers: Number(e.target.value) || 0 })
                  }
                  placeholder="Followers"
                  aria-label="Minimum followers"
                />
                <span className="shrink-0 text-sm text-ink-faint">followers →</span>
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  step="0.1"
                  value={tier.multiplier}
                  onChange={(e) =>
                    updateTier(i, { multiplier: Number(e.target.value) || 1 })
                  }
                  placeholder="1.5"
                  aria-label="Rate multiplier"
                />
                <span className="shrink-0 text-sm text-ink-faint">×</span>
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-status-error hover:bg-status-error/10"
                  aria-label="Remove tier"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
