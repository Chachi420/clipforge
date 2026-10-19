"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { updateCampaignSettings, type CampaignSettingsPatch } from "@/lib/brand-actions";
import { getCampaignRateTiers } from "@/lib/eligibility";
import EligibilitySection, {
  emptyEligibility,
  type EligibilityState,
} from "@/components/brand/EligibilitySection";
import ContentRequirementsSection, {
  emptyContentRequirements,
  type ContentRequirementsState,
} from "@/components/brand/ContentRequirementsSection";
import { PLATFORM_LABELS, type BrandCampaign, type EligibilityType, type Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["instagram", "youtube"];

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
  const [eligibility, setEligibility] = useState<EligibilityState>({
    type: (campaign.eligibilityType ?? "open") as EligibilityType,
    minFollowers: campaign.minFollowers ? String(campaign.minFollowers) : "",
    minAvgViews: campaign.minAvgViews ? String(campaign.minAvgViews) : "",
    rateTiers: [],
  });
  const [content, setContent] = useState<ContentRequirementsState>({
    promoFormats: campaign.promoFormats ?? ["video"],
    aspectRatios: campaign.aspectRatios ?? ["9:16"],
    minDurationSec: campaign.minDurationSec != null ? String(campaign.minDurationSec) : "",
    maxDurationSec: campaign.maxDurationSec != null ? String(campaign.maxDurationSec) : "",
    requiredHashtags: (campaign.requiredHashtags ?? []).join(", "),
    requiredTags: (campaign.requiredTags ?? []).join(", "),
    sourceMaterialUrl: campaign.sourceMaterialUrl ?? "",
    minClipsExpected: String(campaign.minClipsExpected ?? 1),
    requiresPreapproval: campaign.requiresPreapproval ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  // Load existing rate tiers.
  useEffect(() => {
    getCampaignRateTiers(campaign.id)
      .then((tiers) => setEligibility((prev) => ({ ...prev, rateTiers: tiers })))
      .catch(() => {});
  }, [campaign.id]);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (eligibility.type === "followers" && !(Number(eligibility.minFollowers) > 0)) {
      setBusy(false);
      return setMessage({ tone: "err", text: "Set a minimum follower count." });
    }
    if (eligibility.type === "engagement" && !(Number(eligibility.minAvgViews) > 0)) {
      setBusy(false);
      return setMessage({ tone: "err", text: "Set a minimum average view count." });
    }
    if (content.promoFormats.length === 0) {
      setBusy(false);
      return setMessage({ tone: "err", text: "Pick at least one promotion format." });
    }
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
      eligibilityType: eligibility.type,
      minFollowers: eligibility.type === "followers" ? Number(eligibility.minFollowers) : null,
      minAvgViews: eligibility.type === "engagement" ? Number(eligibility.minAvgViews) : null,
      rateTiers: eligibility.rateTiers,
      promoFormats: content.promoFormats,
      aspectRatios: content.aspectRatios.length > 0 ? content.aspectRatios : ["9:16"],
      minDurationSec: content.minDurationSec.trim() === "" ? null : Number(content.minDurationSec) || null,
      maxDurationSec: content.maxDurationSec.trim() === "" ? null : Number(content.maxDurationSec) || null,
      requiredHashtags: content.requiredHashtags.split(",").map((s) => s.trim()).filter(Boolean),
      requiredTags: content.requiredTags.split(",").map((s) => s.trim()).filter(Boolean),
      sourceMaterialUrl: content.sourceMaterialUrl.trim() || null,
      minClipsExpected: Number(content.minClipsExpected) || 1,
      requiresPreapproval: content.requiresPreapproval,
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
                  className="h-4 w-4 accent-ink"
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
        <div className="border-t border-line/10 pt-5 sm:col-span-2">
          <EligibilitySection value={eligibility} onChange={setEligibility} />
        </div>
        <div className="border-t border-line/10 pt-5 sm:col-span-2">
          <ContentRequirementsSection value={content} onChange={setContent} />
        </div>
        {message && (
          <p className={`text-sm sm:col-span-2 ${message.tone === "ok" ? "text-status-success" : "text-status-error"}`}>
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
