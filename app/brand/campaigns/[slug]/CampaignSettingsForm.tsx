"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { updateCampaignSettings, type CampaignSettingsPatch } from "@/lib/brand-actions";
import { PLATFORM_LABELS, type BrandCampaign, type Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

export default function CampaignSettingsForm({ campaign }: { campaign: BrandCampaign }) {
  const router = useRouter();
  const [name, setName] = useState(campaign.name);
  const [ratePer100k, setRatePer100k] = useState(String(campaign.ratePer100k));
  const [budgetCap, setBudgetCap] = useState(campaign.budgetCap ? String(campaign.budgetCap) : "");
  const [minViewsPerPost, setMinViewsPerPost] = useState(String(campaign.minViewsPerPost));
  const [minViewsTotal, setMinViewsTotal] = useState(String(campaign.minViewsTotal));
  const [daysLeft, setDaysLeft] = useState(String(campaign.daysLeft));
  const [category, setCategory] = useState(campaign.category);
  const [platforms, setPlatforms] = useState<Platform[]>(campaign.platforms);
  const [rules, setRules] = useState(campaign.rules);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const patch: CampaignSettingsPatch = {
      name,
      ratePer100k: Number(ratePer100k),
      budgetCap: budgetCap.trim() === "" ? null : Number(budgetCap),
      minViewsPerPost: Number(minViewsPerPost),
      minViewsTotal: Number(minViewsTotal),
      platforms,
      category,
      daysLeft: Number(daysLeft),
      rules,
    };
    try {
      await updateCampaignSettings(campaign.id, patch);
      setMessage({ tone: "ok", text: "Settings saved." });
      router.refresh();
    } catch (err) {
      setMessage({ tone: "err", text: err instanceof Error ? err.message : "Could not save settings." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Campaign name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
        </div>
        <Field label="Rate per 100K views (USD)">
          <input
            className={inputCls}
            type="number"
            min="0.01"
            step="0.01"
            value={ratePer100k}
            onChange={(e) => setRatePer100k(e.target.value)}
            required
          />
        </Field>
        <Field label="Budget cap (USD, blank = none)">
          <input
            className={inputCls}
            type="number"
            min="1"
            step="1"
            value={budgetCap}
            onChange={(e) => setBudgetCap(e.target.value)}
            placeholder="No cap"
          />
        </Field>
        <Field label="Min views per post">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="1"
            value={minViewsPerPost}
            onChange={(e) => setMinViewsPerPost(e.target.value)}
          />
        </Field>
        <Field label="Min total views">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="1"
            value={minViewsTotal}
            onChange={(e) => setMinViewsTotal(e.target.value)}
          />
        </Field>
        <Field label="Category">
          <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} />
        </Field>
        <Field label="Days left">
          <input
            className={inputCls}
            type="number"
            min="1"
            max="365"
            step="1"
            value={daysLeft}
            onChange={(e) => setDaysLeft(e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Platforms
          </span>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={platforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                  className="h-4 w-4 accent-emerald-500"
                />
                {PLATFORM_LABELS[p]}
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Field label="Campaign rules">
            <textarea
              className={inputCls}
              rows={6}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Guidelines for clippers: content rules, exclusions, payout notes…"
            />
          </Field>
        </div>
        {message && (
          <p className={`text-sm sm:col-span-2 ${message.tone === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {message.text}
          </p>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
