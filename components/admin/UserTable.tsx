"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { updateUserRole, type AdminUser } from "@/lib/admin-actions";

const ROLES = ["clipper", "brand", "admin"] as const;

export default function UserTable({ initial }: { initial: AdminUser[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function changeRole(id: string, role: string, name: string) {
    if (!window.confirm(`Change ${name}'s role to ${role}?`)) return;
    setBusy(id);
    setError(null);
    try {
      await updateUserRole(id, role);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Role change failed.");
    } finally {
      setBusy(null);
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
              {initial.map((u) => (
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
                      onChange={(e) => changeRole(u.id, e.target.value, u.displayName)}
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
      <p className="text-xs text-ink-faint">
        Role controls which side a user lands on: clipper → dashboard, brand → brand dashboard, admin → this panel. You cannot change your own role.
      </p>
    </div>
  );
}
