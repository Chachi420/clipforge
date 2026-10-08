"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Badge, Button, Card, EmptyState, PlatformDot, inputCls } from "@/components/ui";
import { approveAccount, rejectAccount, type PendingVerification } from "@/lib/admin-actions";
import { PLATFORM_LABELS } from "@/lib/types";

export default function VerificationsClient({ initial }: { initial: PendingVerification[] }) {
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleApprove(id: string) {
    const n = Number(counts[id] ?? "");
    if (!Number.isFinite(n) || n < 0) {
      setError("Enter the follower count before approving.");
      return;
    }
    setBusy(id);
    setError(null);
    try {
      await approveAccount(id, Math.floor(n));
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Approve failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this account? It will be removed; the user can re-add it.")) return;
    setBusy(id);
    setError(null);
    try {
      await rejectAccount(id);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Reject failed.");
    } finally {
      setBusy(null);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="Queue clear" body="No accounts are waiting for verification." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300">{error}</p>
      )}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Connected</th>
              <th className="px-4 py-3">Followers</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/10">
            {initial.map((v) => (
              <tr key={v.id} className="transition hover:bg-ink/[0.03]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium text-ink">
                    <PlatformDot platform={v.platform} />
                    {v.handle}
                  </div>
                  <div className="mt-0.5 text-xs capitalize text-ink-faint">
                    {PLATFORM_LABELS[v.platform as keyof typeof PLATFORM_LABELS] ?? v.platform}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{v.displayName}</div>
                  <div className="text-xs text-ink-faint">{v.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded-lg bg-surface-deep px-2.5 py-1 font-mono text-sm font-bold tracking-widest text-ink">
                    {v.verificationCode}
                  </code>
                </td>
                <td className="px-4 py-3 text-ink-soft">{v.connectedAt}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={counts[v.id] ?? ""}
                    onChange={(e) => setCounts((c) => ({ ...c, [v.id]: e.target.value }))}
                    placeholder="e.g. 2400"
                    className={`${inputCls} max-w-[130px]`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleApprove(v.id)}
                      disabled={busy === v.id}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      <Check size={14} /> {busy === v.id ? "…" : "Approve"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(v.id)}
                      disabled={busy === v.id}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      <X size={14} /> Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-ink-faint">
        Approve only after confirming the code is in the account&apos;s bio and it has at
        least 1,000 followers. Rejecting removes the account; the user can re-add it.
      </p>
    </div>
  );
}
