"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Badge, Button, Card, Dialog, EmptyState, PlatformDot, inputCls } from "./ui";
import { PLATFORM_LABELS, type Clip, type Platform, type TrackingStatus } from "@/lib/types";
import { formatCompact, formatMoney } from "@/lib/format";
import { deleteClip } from "@/lib/actions";

const PAGE_SIZE = 20;
const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

const SORTS = [
  { v: "views", l: "Most views" },
  { v: "payout", l: "Highest payout" },
  { v: "newest", l: "Newest" },
] as const;
type SortKey = (typeof SORTS)[number]["v"];

const STATUS_META: Record<TrackingStatus, { label: string; tone: "success" | "warning" | "error" | "default" }> = {
  tracking: { label: "Tracking", tone: "success" },
  pending_review: { label: "Pending review", tone: "warning" },
  not_tracking: { label: "Not tracking", tone: "default" },
  flagged: { label: "Flagged", tone: "error" },
};
const STATUS_KEYS = Object.keys(STATUS_META) as TrackingStatus[];

function chip(active: boolean) {
  return `rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-micro ${
    active ? "bg-ink text-paper" : "bg-ink/5 text-ink-soft hover:bg-ink/10"
  }`;
}

export function ClipTable({ clips }: { clips: Clip[] }) {
  const [query, setQuery] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [statuses, setStatuses] = useState<TrackingStatus[]>([]);
  const [sort, setSort] = useState<SortKey>("views");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let out = clips.filter((c) =>
      c.accountHandle.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (platforms.length) out = out.filter((c) => platforms.includes(c.platform));
    if (statuses.length) out = out.filter((c) => statuses.includes(c.trackingStatus));
    switch (sort) {
      case "views": out = [...out].sort((a, b) => b.views - a.views); break;
      case "payout": out = [...out].sort((a, b) => b.payout - a.payout); break;
      case "newest": out = [...out].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)); break;
    }
    return out;
  }, [clips, query, platforms, statuses, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageClips = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const open = clips.find((c) => c.id === openId);

  const filtersActive = query.trim() !== "" || platforms.length > 0 || statuses.length > 0;

  function resetPage() { setPage(0); }
  function togglePlatform(p: Platform) {
    setPlatforms((xs) => (xs.includes(p) ? xs.filter((x) => x !== p) : [...xs, p]));
    resetPage();
  }
  function toggleStatus(s: TrackingStatus) {
    setStatuses((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s]));
    resetPage();
  }
  function clearFilters() {
    setQuery(""); setPlatforms([]); setStatuses([]); resetPage();
  }

  return (
    <>
      <Card className="p-4">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="relative">
            <label htmlFor="clip-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Account
            </label>
            <Search size={15} className="pointer-events-none absolute left-3.5 top-[38px] text-ink-faint" aria-hidden />
            <input
              id="clip-search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              placeholder="Search by handle…"
              className={`${inputCls} pl-9 sm:w-56`}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-faint">Sort by</span>
            <select
              className={inputCls}
              value={sort}
              aria-label="Sort clips"
              onChange={(e) => { setSort(e.target.value as SortKey); resetPage(); }}
            >
              {SORTS.map((s) => (
                <option key={s.v} value={s.v}>{s.l}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-faint">Platform</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter clips by platform">
              {PLATFORMS.map((p) => (
                <button key={p} type="button" onClick={() => togglePlatform(p)}
                  aria-pressed={platforms.includes(p)} className={chip(platforms.includes(p))}>
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-faint">Status</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter clips by tracking status">
              {STATUS_KEYS.map((s) => (
                <button key={s} type="button" onClick={() => toggleStatus(s)}
                  aria-pressed={statuses.includes(s)} className={chip(statuses.includes(s))}>
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>
          {filtersActive && (
            <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={filtersActive ? "No clips match these filters" : "No clips yet"}
              body={filtersActive
                ? "Try a different search or clear the filters to see all your clips."
                : "Upload your first clip to start tracking views and earnings."}
              action={filtersActive ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : undefined}
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-[11px] uppercase tracking-wider text-ink-faint">
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Platform</th>
                    <th className="px-4 py-3 font-semibold">Account</th>
                    <th className="px-4 py-3 text-right font-semibold">Views</th>
                    <th className="px-4 py-3 text-right font-semibold">Likes</th>
                    <th className="px-4 py-3 text-right font-semibold">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {pageClips.map((c) => (
                    <tr key={c.id} onClick={() => setOpenId(c.id)}
                      className="cursor-pointer border-b border-line/10 transition-colors duration-micro last:border-0 hover:bg-ink/[0.03]">
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_META[c.trackingStatus].tone}>{STATUS_META[c.trackingStatus].label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-ink-soft">
                          <PlatformDot platform={c.platform} /> {PLATFORM_LABELS[c.platform]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{c.accountHandle}</td>
                      <td className="tnum px-4 py-3 text-right font-semibold text-ink">{formatCompact(c.views)}</td>
                      <td className="tnum px-4 py-3 text-right text-ink-soft">{formatCompact(c.likes)}</td>
                      <td className="tnum px-4 py-3 text-right font-semibold text-ink">{formatMoney(c.payout)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="mt-4 space-y-3 md:hidden">
              {pageClips.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(c.id)}
                    className="block w-full rounded-card border border-line/10 p-4 text-left transition-colors duration-micro hover:bg-ink/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <PlatformDot platform={c.platform} /> {c.accountHandle}
                      </span>
                      <Badge tone={STATUS_META[c.trackingStatus].tone}>{STATUS_META[c.trackingStatus].label}</Badge>
                    </div>
                    <div className="tnum mt-3 flex items-baseline justify-between">
                      <span className="text-sm text-ink-faint">{formatCompact(c.views)} views · {formatCompact(c.likes)} likes</span>
                      <span className="text-base font-bold text-ink">{formatMoney(c.payout)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-line/10 pt-4">
                <p className="tnum text-sm text-ink-faint">
                  Showing {safePage * PAGE_SIZE + 1}–{Math.min(filtered.length, safePage * PAGE_SIZE + PAGE_SIZE)} of {filtered.length} clips
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0}>
                    Previous
                  </Button>
                  <span className="tnum text-sm text-ink-faint">Page {safePage + 1} of {totalPages}</span>
                  <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {open && <ClipDetailDialog clip={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function ClipDetailDialog({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this clip? Tracking will stop.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteClip(clip.id);
      onClose();
      router.refresh();
    } catch (e: any) {
      setDeleteError(e.message ?? "Could not delete clip.");
      setDeleting(false);
    }
  }

  return (
    <Dialog title="Clip details" subtitle={`${PLATFORM_LABELS[clip.platform]} post · ${clip.accountHandle}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Views", formatCompact(clip.views)], ["Likes", formatCompact(clip.likes)],
          ["Comments", formatCompact(clip.comments)], ["Engagement", `${clip.engagementPct}%`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-card border border-line/10 p-4">
            <div className="text-[11px] uppercase tracking-wider text-ink-faint">{l}</div>
            <div className="tnum mt-1 text-xl font-bold text-ink">{v}</div>
          </div>
        ))}
        <div className="col-span-2 rounded-card border border-line/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Tracking status</span>
            <Badge tone={STATUS_META[clip.trackingStatus].tone}>{STATUS_META[clip.trackingStatus].label}</Badge>
          </div>
          <div className="tnum mt-2 text-xs text-ink-faint">Submitted {clip.submittedAt}</div>
          {deleteError && (
            <p role="alert" className="mt-3 rounded-card border border-status-error/25 bg-status-error/10 px-3 py-2 text-sm text-status-error">
              {deleteError}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-2">
            <a href={clip.postUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-ink-soft hover:text-ink hover:underline">
              Open post
            </a>
            <Button variant="outline" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete clip"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
