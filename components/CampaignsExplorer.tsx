"use client";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import CampaignCard from "@/components/CampaignCard";
import { Button, Dialog, Field, inputCls } from "@/components/ui";
import { CAMPAIGN_RULES, HOW_IT_WORKS } from "@/lib/mock";
import type { Campaign } from "@/lib/types";

const SORTS = ["Recently updated", "Recently created", "Highest payout", "Name A–Z"] as const;
const STATUSES = ["all", "active", "paused"] as const;
const TYPES = [
  { v: "all", l: "All types" }, { v: "per_view", l: "Per-view rate" },
  { v: "bounty", l: "Has bounties" }, { v: "pot", l: "Pot payout" },
] as const;
const CATEGORIES = ["All categories", "IRL Content", "Brands", "Gaming", "Sports", "Podcasts", "Music", "Gambling", "TV & Streaming", "Other"];
const PLATFORMS = ["tiktok", "instagram", "youtube", "x"] as const;

interface Filters {
  sort: (typeof SORTS)[number];
  minPayout: number;
  status: (typeof STATUSES)[number];
  type: string;
  category: string;
  platforms: string[];
}

const DEFAULTS: Filters = {
  sort: "Recently updated", minPayout: 0, status: "all",
  type: "all", category: "All categories", platforms: [],
};

export default function CampaignsPage({ initial }: { initial: Campaign[] }) {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [showFilters, setShowFilters] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const list = useMemo(() => {
    let out = [...initial];
    if (filters.status !== "all") out = out.filter((c) => c.status === filters.status);
    if (filters.type !== "all")
      out = out.filter((c) => (filters.type === "bounty" ? c.type !== "per_view" : c.type === filters.type));
    if (filters.category !== "All categories") out = out.filter((c) => c.category === filters.category);
    if (filters.platforms.length) out = out.filter((c) => filters.platforms.some((p) => c.platforms.includes(p as any)));
    out = out.filter((c) => (c.potValue ?? c.ratePer100k) >= filters.minPayout);
    switch (filters.sort) {
      case "Highest payout": out.sort((a, b) => (b.potValue ?? b.ratePer100k) - (a.potValue ?? a.ratePer100k)); break;
      case "Name A–Z": out.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return out;
  }, [initial, filters]);

  return (
    <>
      <Header title="Campaigns" subtitle={`${initial.length} campaigns available`} />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="glass mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
          <p className="text-sm text-ink-soft">New to campaigns? Learn how they work before you join.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRules(true)}>Rules</Button>
            <Button variant="outline" onClick={() => setShowHow(true)}>How it works</Button>
            <Button onClick={() => setShowFilters(true)}>Filters</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </div>
        {list.length === 0 && <p className="py-16 text-center text-ink-faint">No campaigns match these filters.</p>}
      </div>

      {showFilters && (
        <Dialog title="Filters" onClose={() => setShowFilters(false)}>
          <div className="space-y-5">
            <Field label="Sort by">
              <select className={inputCls} value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as Filters["sort"] })}>
                {SORTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label={`Minimum payout — $${filters.minPayout} per 100k`}>
              <input type="range" min={0} max={300} step={15} className="w-full accent-electric"
                value={filters.minPayout}
                onChange={(e) => setFilters({ ...filters, minPayout: Number(e.target.value) })} />
            </Field>
            <Field label="Status">
              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => setFilters({ ...filters, status: s })}
                    className={`rounded-full px-3 py-1.5 text-sm capitalize ${filters.status === s ? "bg-electric text-white" : "bg-ink/5 text-ink-soft"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Campaign type">
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button key={t.v} onClick={() => setFilters({ ...filters, type: t.v })}
                    className={`rounded-full px-3 py-1.5 text-sm ${filters.type === t.v ? "bg-electric text-white" : "bg-ink/5 text-ink-soft"}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Platforms">
              <div className="flex gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p}
                    onClick={() => setFilters({
                      ...filters,
                      platforms: filters.platforms.includes(p)
                        ? filters.platforms.filter((x) => x !== p)
                        : [...filters.platforms, p],
                    })}
                    className={`rounded-full px-3 py-1.5 text-sm capitalize ${filters.platforms.includes(p) ? "bg-electric text-white" : "bg-ink/5 text-ink-soft"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setFilters(DEFAULTS)}>Reset filters</Button>
              <Button onClick={() => setShowFilters(false)}>Apply filters</Button>
            </div>
          </div>
        </Dialog>
      )}

      {showRules && (
        <Dialog title="Campaign rules" subtitle="Read these before you post" onClose={() => setShowRules(false)}>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-ink-soft">
            {CAMPAIGN_RULES.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
          <div className="mt-6"><Button className="w-full" onClick={() => setShowRules(false)}>I understand</Button></div>
        </Dialog>
      )}

      {showHow && (
        <Dialog title="How campaigns work" onClose={() => setShowHow(false)} wide>
          <div className="grid gap-4 md:grid-cols-2">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.title} className="rounded-2xl border border-line/10 p-4">
                <div className="font-bold text-ink">{h.title}</div>
                <p className="mt-1.5 text-sm text-ink-soft">{h.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6"><Button className="w-full" onClick={() => setShowHow(false)}>Got it</Button></div>
        </Dialog>
      )}
    </>
  );
}
