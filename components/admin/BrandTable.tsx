"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, RotateCcw } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { setBrandStatus, type AdminBrand } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

export default function BrandTable({ initial }: { initial: AdminBrand[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function act(id: string, status: "active" | "suspended", name: string) {
    let reason: string | null = null;
    if (status === "suspended") {
      reason = window.prompt(`Suspend ${name}? Its live campaigns will be paused. Reason (shown to the brand):`);
      if (reason === null) return;
    }
    setBusy(id);
    setError(null);
    try {
      await setBrandStatus(id, status, reason ?? undefined);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setBusy(null);
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
              {initial.map((b) => (
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
                      <Button onClick={() => act(b.id, "active", b.name)} disabled={busy === b.id} className="!px-3 !py-1.5 text-xs">
                        <RotateCcw size={14} /> {busy === b.id ? "…" : "Reactivate"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => act(b.id, "suspended", b.name)}
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
      <p className="text-xs text-ink-faint">
        Suspending pauses the brand's live campaigns. Reactivating leaves campaigns paused — re-activate them from the Campaigns page.
      </p>
    </div>
  );
}
