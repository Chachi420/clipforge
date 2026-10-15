"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Badge, Button, Card, Dialog, EmptyState } from "@/components/ui";
import { updateUserRole, type AdminUser } from "@/lib/admin-actions";

const ROLES = ["clipper", "brand"] as const;

export default function UserTable({ initial }: { initial: AdminUser[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState<{ id: string; role: string; name: string } | null>(null);
  const router = useRouter();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter((u) =>
      [u.displayName, u.email, u.role].join(" ").toLowerCase().includes(q)
    );
  }, [initial, query]);

  async function changeRole(id: string, role: string) {
    setBusy(id);
    setError(null);
    try {
      await updateUserRole(id, role);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Role change failed.");
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="No users yet" body="Signed-up users will show up here." />;
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
          placeholder="Search name, email, role…"
          className="w-full rounded-full border border-line/20 bg-paper py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No matches" body="Try a different search." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 bg-ink/[0.03] text-[11px] uppercase tracking-wider text-ink-faint">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {rows.map((u) => (
                  <tr key={u.id} className="transition hover:bg-ink/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{u.displayName}</div>
                      <div className="text-xs text-ink-faint">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.status === "suspended" ? "red" : "green"}>
                        {u.status === "suspended" ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={busy === u.id}
                        onChange={(e) => setConfirming({ id: u.id, role: e.target.value, name: u.displayName })}
                        className="rounded-md border border-line bg-paper px-2 py-1.5 text-sm text-ink"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{u.joinedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <p className="text-xs text-ink-faint">
        Role controls which side a user lands on: clipper → dashboard, brand → brand dashboard. Admin access is restricted to the owner's Google account and can't be granted here. You cannot change your own role.
      </p>
      {confirming && (
        <Dialog
          title="Change role?"
          subtitle={`${confirming.name} will move to the ${confirming.role} side. This is logged in the activity feed.`}
          onClose={() => setConfirming(null)}
        >
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setConfirming(null); router.refresh(); }}>
              Cancel
            </Button>
            <Button onClick={() => changeRole(confirming.id, confirming.role)} disabled={busy === confirming.id}>
              {busy === confirming.id ? "Saving…" : `Make ${confirming.role}`}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
