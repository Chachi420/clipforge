"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, RotateCcw, Search } from "lucide-react";
import { Badge, Button, Card, Dialog, EmptyState, Field } from "@/components/ui";
import { setBrandStatus, type AdminBrand } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

export default function BrandTable({ initial }: { initial: AdminBrand[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suspending, setSuspending] = useState<{ id: string; name: string } | null>(null);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter((b) =>
      [b.name, b.contactEmail, b.ownerName, b.ownerEmail].join(" ").toLowerCase().includes(q)
    );
  }, [initial, query]);

  async function act(id: string, status: "active" | "suspended", r?: string) {
    setBusy(id);
    setError(null);
    try {
      await setBrandStatus(id, status, r);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setBusy(null);
      setSuspending(null);
      setReason("");
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="No brands yet" body="Approved brand access requests create brands here." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-status-error/10 px-4 py-2.5 text-sm text-status-error">{error}</p>
      )}
      <div className="relative min-w-[220px] max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand or owner…"
          className="w-full rounded-full border border-line/20 bg-paper py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No matches" body="Try a different search." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Campaigns</th>
                  <th className="px-4 py-3 text-right">Live</th>
                  <th className="px-4 py-3 text-right">Total top-ups</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {rows.map((b) => (
                  <tr key={b.id} className="transition hover:bg-ink/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{b.name}</div>
                      <div className="text-xs text-ink-faint">{b.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{b.ownerName}</div>
                      <div className="text-xs text-ink-faint">{b.ownerEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={b.status === "suspended" ? "red" : "green"}>
                        {b.status === "suspended" ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{b.campaignCount}</td>
                    <td className="px-4 py-3 text-right text-ink-soft">{b.liveCampaigns}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{formatMoney(b.totalTopups)}</td>
                    <td className="px-4 py-3 text-ink-soft">{b.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "suspended" ? (
                        <Button onClick={() => act(b.id, "active")} disabled={busy === b.id} className="!px-3 !py-1.5 text-xs">
                          <RotateCcw size={14} /> {busy === b.id ? "…" : "Reactivate"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setSuspending({ id: b.id, name: b.name })}
                          disabled={busy === b.id}
                          variant="outline"
                          className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                        >
                          <Ban size={14} /> {busy === b.id ? "…" : "Suspend"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <p className="text-xs text-ink-faint">
        Suspending pauses the brand's live campaigns. Reactivating leaves campaigns paused — re-activate them from the Campaigns page.
      </p>
      {suspending && (
        <Dialog
          title={`Suspend ${suspending.name}?`}
          subtitle="Its live campaigns will be paused. The brand will see your reason."
          onClose={() => { setSuspending(null); setReason(""); }}
        >
          <Field label="Reason (shown to the brand)">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Optional"
              className="w-full rounded-lg border border-line/20 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
            />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setSuspending(null); setReason(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => act(suspending.id, "suspended", reason.trim() || undefined)}
              disabled={busy === suspending.id}
              className="!bg-status-error hover:!bg-status-error/90"
            >
              {busy === suspending.id ? "Suspending…" : "Suspend brand"}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
