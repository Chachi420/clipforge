"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, ProgressBar, inputCls } from "@/components/ui";
import { createBounty, deleteBounty, toggleBounty } from "@/lib/brand-actions";
import { formatCompact, formatMoney } from "@/lib/format";
import type { Bounty } from "@/lib/types";

export default function BountyManager({
  campaignId,
  initial,
}: {
  campaignId: string;
  initial: Bounty[];
}) {
  const router = useRouter();
  const [bounties, setBounties] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [ratePer100k, setRatePer100k] = useState("");
  const [requirements, setRequirements] = useState("");
  const [budgetCap, setBudgetCap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createBounty(campaignId, {
        name,
        ratePer100k: Number(ratePer100k),
        requirements: requirements || undefined,
        budgetCap: budgetCap ? Number(budgetCap) : null,
      });
      setName("");
      setRatePer100k("");
      setRequirements("");
      setBudgetCap("");
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create bounty.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(b: Bounty) {
    try {
      await toggleBounty(b.id, !b.isActive);
      setBounties((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x)));
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update bounty.");
    }
  }

  async function handleDelete(b: Bounty) {
    if (!confirm(`Delete bounty "${b.name}"? Clips already tied to it stay, but the bounty will be gone.`)) return;
    try {
      await deleteBounty(b.id);
      setBounties((prev) => prev.filter((x) => x.id !== b.id));
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete bounty.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{bounties.length} bounties</h2>
        <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "ghost" : "primary"}>
          {showForm ? "Cancel" : "New bounty"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Bounty name">
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. First 100K views bonus"
                  required
                />
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
                placeholder="10"
                required
              />
            </Field>
            <Field label="Budget cap (USD, optional)">
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
            <div className="sm:col-span-2">
              <Field label="Requirements (optional)">
                <textarea
                  className={inputCls}
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="What does a clip need to qualify for this bounty?"
                />
              </Field>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create bounty"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {bounties.length === 0 ? (
        <EmptyState
          title="No bounties — create one"
          body="Bounties are bonus offers on top of the base campaign rate. Create one to incentivize standout clips."
        />
      ) : (
        <div className="grid gap-4">
          {bounties.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-ink">{b.name}</h3>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        b.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-ink-faint"
                      }`}
                    >
                      {b.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatMoney(b.ratePer100k)} / 100K views · {b.clipCount} clips ·{" "}
                    {formatCompact(b.totalViews)} views
                    {b.budgetCap ? ` · cap ${formatMoney(b.budgetCap)}` : ""}
                  </p>
                  {b.budgetCap ? (
                    <div className="mt-2 max-w-xs">
                      <ProgressBar pct={b.budgetUsedPct} />
                    </div>
                  ) : null}
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    checked={b.isActive}
                    onChange={() => handleToggle(b)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  Live
                </label>
                <button
                  onClick={() => handleDelete(b)}
                  className="rounded-lg p-2 text-ink-faint hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                  aria-label={`Delete ${b.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {b.requirements && (
                <p className="mt-3 border-t border-line/10 pt-3 text-sm text-ink-soft">
                  {b.requirements}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
