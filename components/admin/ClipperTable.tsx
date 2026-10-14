"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ban, RotateCcw } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { setClipperStatus, type AdminClipper } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

export default function ClipperTable({ initial }: { initial: AdminClipper[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function act(id: string, status: "active" | "suspended", name: string) {
    if (status === "suspended" && !window.confirm(`Suspend ${name}? They cannot upload new clips while suspended.`)) return;
    setBusy(id);
    setError(null);
    try {
      await setClipperStatus(id, status);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="No clippers yet" body="People who sign up as clippers will show up here." />;
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
                <th className="px-4 py-3">Clipper</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Clips</th>
                <th className="px-4 py-3 text-right">Verified accounts</th>
                <th className="px-4 py-3 text-right">Total earned</th>
                <th className="px-4 py-3 text-right">Pending payout</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {initial.map((c) => (
                <tr key={c.id} className="transition hover:bg-ink/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clippers/${c.id}`} className="font-medium text-ink underline decoration-line hover:decoration-ink">
                      {c.displayName}
                    </Link>
                    <div className="text-xs text-ink-faint">{c.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={c.status === "suspended" ? "red" : "green"}>
                      {c.status === "suspended" ? "Suspended" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{c.clipCount}</td>
                  <td className="px-4 py-3 text-right text-ink-soft">{c.verifiedAccounts}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{formatMoney(c.totalEarned)}</td>
                  <td className="px-4 py-3 text-right text-ink-soft">{formatMoney(c.pendingPayout)}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.joinedAt}</td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "suspended" ? (
                      <Button onClick={() => act(c.id, "active", c.displayName)} disabled={busy === c.id} className="!px-3 !py-1.5 text-xs">
                        <RotateCcw size={14} /> {busy === c.id ? "…" : "Reactivate"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => act(c.id, "suspended", c.displayName)}
                        disabled={busy === c.id}
                        variant="outline"
                        className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                      >
                        <Ban size={14} /> {busy === c.id ? "…" : "Suspend"}
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
        Suspending blocks new clip uploads. Already-approved clips keep tracking until individually flagged on the Clips page.
      </p>
    </div>
  );
}
