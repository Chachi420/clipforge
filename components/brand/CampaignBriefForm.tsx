"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { createCampaignBrief, type CampaignBriefInput } from "@/lib/brand-actions";
import { PLATFORM_LABELS, PAYOUT_METHOD_LABELS, type Platform, type PayoutMethod } from "@/lib/types";

const CATEGORIES = ["Music", "Gaming", "Lifestyle", "Tech", "Education", "Other"] as const;
const TYPES: { value: CampaignBriefInput["type"]; label: string }[] = [
  { value: "per_view", label: "Pay per view" },
  { value: "bounty", label: "Bounty" },
  { value: "pot", label: "Prize pot" },
];
const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];
const PAYOUT_METHODS: PayoutMethod[] = ["paypal", "usdt_eth", "usdc_eth"];

export default function CampaignBriefForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Music");
  const [type, setType] = useState<CampaignBriefInput["type"]>("per_view");
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok"]);
  const [ratePer100k, setRatePer100k] = useState("");
  const [budgetCap, setBudgetCap] = useState("");
  const [durationMode, setDurationMode] = useState<"deadline" | "budget">("deadline");
  const [daysLeft, setDaysLeft] = useState("30");
  const [minViewsPerPost, setMinViewsPerPost] = useState("1000");
  const [minViewsTotal, setMinViewsTotal] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("paypal");
  const [rules, setRules] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    if (n.length < 3) return setError("Give the campaign a name (3+ characters).");
    const rate = Number(ratePer100k);
    if (!(rate > 0)) return setError("Set a rate per 100k views (USD).");
    if (platforms.length === 0) return setError("Pick at least one platform.");

    setSubmitting(true);
    try {
      const { slug } = await createCampaignBrief({
        name: n,
        category,
        type,
        platforms,
        ratePer100k: rate,
        budgetCap: budgetCap.trim() === "" ? null : Number(budgetCap) || null,
        durationMode,
        daysLeft: Number(daysLeft) || 30,
        minViewsPerPost: Number(minViewsPerPost) || 0,
        minViewsTotal: Number(minViewsTotal) || 0,
        payoutMethod,
        rules: rules.trim(),
      });
      router.push(`/brand/campaigns/${slug}`);
    } catch (e: any) {
      setError(e.message ?? "Failed to submit the brief.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
        )}

        <Field label="Campaign name">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Drop — new single"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Category">
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-base-900">
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Payout method (to clippers)">
            <select
              className={inputCls}
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value as PayoutMethod)}
            >
              {PAYOUT_METHODS.map((m) => (
                <option key={m} value={m} className="bg-base-900">
                  {PAYOUT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Campaign type">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  type === t.value
                    ? "border-accent/60 bg-accent/15 text-white"
                    : "border-white/10 bg-base-900 text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Platforms">
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                aria-pressed={platforms.includes(p)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  platforms.includes(p)
                    ? "border-accent/60 bg-accent/15 text-white"
                    : "border-white/10 bg-base-900 text-white/60 hover:text-white"
                }`}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Rate per 100k views (USD)">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="any"
              value={ratePer100k}
              onChange={(e) => setRatePer100k(e.target.value)}
              placeholder="e.g. 25"
            />
          </Field>
          <Field label="Budget cap (USD, optional)">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="any"
              value={budgetCap}
              onChange={(e) => setBudgetCap(e.target.value)}
              placeholder="No cap"
            />
          </Field>
        </div>

        <Field label="Campaign ends by">
          <div className="flex gap-2">
            {(["deadline", "budget"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMode(m)}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  durationMode === m
                    ? "border-accent/60 bg-accent/15 text-white"
                    : "border-white/10 bg-base-900 text-white/60 hover:text-white"
                }`}
              >
                {m === "deadline" ? "Deadline" : "Budget runs out"}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Days left">
            <input
              className={inputCls}
              type="number"
              min="1"
              max="365"
              value={daysLeft}
              onChange={(e) => setDaysLeft(e.target.value)}
            />
          </Field>
          <Field label="Min views per post">
            <input
              className={inputCls}
              type="number"
              min="0"
              value={minViewsPerPost}
              onChange={(e) => setMinViewsPerPost(e.target.value)}
            />
          </Field>
          <Field label="Min views total">
            <input
              className={inputCls}
              type="number"
              min="0"
              value={minViewsTotal}
              onChange={(e) => setMinViewsTotal(e.target.value)}
              placeholder="None"
            />
          </Field>
        </div>

        <Field label="Rules & requirements">
          <textarea
            className={`${inputCls} min-h-[110px] resize-y`}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="What should clippers know? (content rules, sound, posting cadence, do's and don'ts…)"
          />
        </Field>

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-white/35">
            Submitted as a draft — it goes live only after our team approves it.
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit brief"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
