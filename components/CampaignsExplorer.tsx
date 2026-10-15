"use client";
import { useMemo, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import CampaignCard from "@/components/CampaignCard";
import { Badge, Button, Card, Dialog, EmptyState, Field, inputCls } from "@/components/ui";
import { CAMPAIGN_RULES, HOW_IT_WORKS } from "@/lib/mock";
import { PLATFORM_LABELS, type Platform } from "@/lib/types";
import type { Campaign } from "@/lib/types";

const SORTS = [
  { v: "newest", l: "Newest" },
  { v: "rate", l: "Highest rate" },
  { v: "ending", l: "Ending soon" },
] as const;
type SortKey = (typeof SORTS)[number]["v"];

const STATUSES = ["all", "active", "paused"] as const;
const TYPES = [
  { v: "all", l: "All types" },
  { v: "per_view", l: "Per-view rate" },
  { v: "bounty", l: "Has bounties" },
] as const;
const CATEGORIES = ["All categories", "IRL Content", "Brands", "Gaming", "Sports", "Podcasts", "Music", "Gambling", "TV & Streaming", "Other"];
const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

interface Filters {
  sort: SortKey;
  minRate: number;
  status: (typeof STATUSES)[number];
  type: string;
  category: string;
  platforms: Platform[];
}

const DEFAULTS: Filters = {
  sort: "newest", minRate: 0, status: "all",
  type: "all", category: "All categories", platforms: [],
};

function activeCount(f: Filters) {
  let n = 0;
  if (f.sort !== DEFAULTS.sort) n++;
  if (f.minRate !== 0) n++;
  if (f.status !== "all") n++;
  if (f.type !== "all") n++;
  if (f.category !== "All categories") n++;
  if (f.platforms.length) n++;
  return n;
}

function chip(active: boolean) {
  return `rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-micro ${
    active ? "bg-ink text-paper" : "bg-ink/5 text-ink-soft hover:bg-ink/10"
  }`;
}

export default function CampaignsExplorer({ initial }: { initial: Campaign[] }) {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const list = useMemo(() => {
    let out = [...initial];
    if (filters.status !== "all") out = out.filter((c) => c.status === filters.status);
    if (filters.type !== "all")
      out = out.filter((c) => (filters.type === "bounty" ? c.type !== "per_view" : c.type === filters.type));
    if (filters.category !== "All categories") out = out.filter((c) => c.category === filters.category);
    if (filters.platforms.length) out = out.filter((c) => filters.platforms.some((p) => c.platforms.includes(p)));
    out = out.filter((c) => (c.potValue ?? c.ratePer100k) >= filters.minRate);
    switch (filters.sort) {
      case "newest": out.sort((a, b) => b.startDate.localeCompare(a.startDate)); break;
      case "rate": out.sort((a, b) => (b.potValue ?? b.ratePer100k) - (a.potValue ?? a.ratePer100k)); break;
      case "ending": out.sort((a, b) => a.daysLeft - b.daysLeft); break;
    }
    return out;
  }, [initial, filters]);

  const n = activeCount(filters);

  return (
    <>
      <Header title="Campaigns" subtitle={`${list.length} of ${initial.length} campaigns`} />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {/* Newcomer banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line/10 bg-surface px-5 py-4">
          <p className="text-sm text-ink-soft">New to campaigns? Learn how they work before you join.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRules(true)}>Campaign rules</Button>
            <Button variant="outline" onClick={() => setShowHow(true)}>How it works</Button>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="mb-3 md:hidden">
          <Button variant="outline" className="w-full" onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}>
            <SlidersHorizontal size={15} /> {filtersOpen ? "Hide filters" : "Show filters"}
            {n > 0 && (
              <span className="ml-1 rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-paper">{n}</span>
            )}
          </Button>
        </div>

        {/* Filter panel — inline on desktop, collapsible on mobile */}
        <Card className={`mb-6 overflow-hidden ${filtersOpen ? "" : "hidden"} md:block`}>
          <div className="flex items-center justify-between gap-3 border-b border-line/10 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal size={15} className="text-ink-faint" aria-hidden />
              <span className="text-sm font-bold text-ink">Filters</span>
              {n > 0 && <Badge tone="default">{n} active</Badge>}
            </div>
            {n > 0 && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULTS)}
                className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                <RotateCcw size={13} aria-hidden /> Reset
              </button>
            )}
          </div>

          <div className="grid gap-x-8 gap-y-6 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sort & status */}
            <div className="space-y-5">
              <Field label="Sort by">
                <select
                  className={inputCls}
                  value={filters.sort}
                  aria-label="Sort campaigns"
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
                >
                  {SORTS.map((s) => (
                    <option key={s.v} value={s.v}>{s.l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => setFilters({ ...filters, status: s })}
                      className={chip(filters.status === s)} aria-pressed={filters.status === s}>
                      {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Type & category */}
            <div className="space-y-5">
              <Field label="Campaign type">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by campaign type">
                  {TYPES.map((t) => (
                    <button
                      key={t.v}
                      type="button"
                      aria-pressed={filters.type === t.v}
                      onClick={() => setFilters({ ...filters, type: t.v })}
                      className={chip(filters.type === t.v)}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Category">
                <select
                  className={inputCls}
                  value={filters.category}
                  aria-label="Filter by category"
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            {/* Rate & platforms */}
            <div className="space-y-5 sm:col-span-2 lg:col-span-1">
              <Field label="Minimum rate">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={300}
                    step={15}
                    className="w-full accent-ink"
                    aria-label="Minimum rate per 100K views"
                    value={filters.minRate}
                    onChange={(e) => setFilters({ ...filters, minRate: Number(e.target.value) })}
                  />
                  <span className="tnum w-20 shrink-0 rounded-md bg-ink/5 px-2 py-1.5 text-center text-sm font-bold text-ink">
                    ${filters.minRate}+
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-ink-faint">per 100K verified views</p>
              </Field>
              <Field label="Platforms">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by platform">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={filters.platforms.includes(p)}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          platforms: filters.platforms.includes(p)
                            ? filters.platforms.filter((x) => x !== p)
                            : [...filters.platforms, p],
                        })
                      }
                      className={chip(filters.platforms.includes(p))}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        </Card>

        {/* Campaign grid */}
        {list.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        ) : (
          <EmptyState
            title="No campaigns match these filters"
            body="Try lowering the minimum rate or clearing a filter to see more campaigns."
            action={<Button variant="outline" onClick={() => setFilters(DEFAULTS)}>Reset filters</Button>}
          />
        )}
      </div>

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
              <div key={h.title} className="rounded-card border border-line/10 p-4">
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
