"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ban, RotateCcw, Search } from "lucide-react";
import { Badge, Button, Card, Dialog, EmptyState } from "@/components/ui";
import { setClipperStatus, type AdminClipper } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

export default function ClipperTable({ initial }: { initial: AdminClipper[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suspending, setSuspending] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter((c) =>
      [c.displayName, c.email].join(" ").toLowerCase().includes(q)
    );
  }, [initial, query]);

  async function act(id: string, status: "active" | "suspended") {
    setBusy(id);
    setError(null);
    try {
      await setClipperStatus(id, status);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setBusy(null);
      setSuspending(null);
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
      <div className="relative min-w-[220px] max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email…"
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
                {rows.map((c) => (
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
                        <Button onClick={() => act(c.id, "active")} disabled={busy === c.id} className="!px-3 !py-1.5 text-xs">
                          <RotateCcw size={14} /> {busy === c.id ? "…" : "Reactivate"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setSuspending({ id: c.id, name: c.displayName })}
                          disabled={busy === c.id}
                          variant="outline"
                          className="!px-3 !py-1.5 text-xs !text-status-error !border-status-error/30 hover:!bg-status-error/10"
                        >
                          <Ban size={14} /> Suspend
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
        Suspending blocks new clip uploads. Already-approved clips keep tracking until individually flagged on the Clips page.
      </p>
      {suspending && (
        <Dialog
          title={`Suspend ${suspending.name}?`}
          subtitle="They cannot upload new clips while suspended. This is logged in the activity feed."
          onClose={() => setSuspending(null)}
        >
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSuspending(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => act(suspending.id, "suspended")}
              disabled={busy === suspending.id}
              className="!bg-status-error hover:!bg-status-error/90"
            >
              {busy === suspending.id ? "Suspending…" : "Suspend clipper"}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
