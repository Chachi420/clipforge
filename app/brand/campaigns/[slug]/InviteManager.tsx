"use client";

import { useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, inputCls, Badge } from "@/components/ui";
import { inviteClipper, getCampaignInvites, revokeInvite } from "@/lib/eligibility";
import type { CampaignInvite } from "@/lib/types";

const STATUS_TONES: Record<CampaignInvite["status"], "green" | "amber" | "default"> = {
  accepted: "green",
  pending: "amber",
  expired: "default",
};

/** Invite-only campaign: send invites and track their status. */
export default function InviteManager({ campaignId }: { campaignId: string }) {
  const [invites, setInvites] = useState<CampaignInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    try {
      setInvites(await getCampaignInvites(campaignId));
    } catch {
      /* keep existing list on transient failure */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await inviteClipper(campaignId, identifier);
      setMessage({ tone: "ok", text: res.message });
      setIdentifier("");
      await refresh();
    } catch (err) {
      setMessage({
        tone: "err",
        text: err instanceof Error ? err.message : "Could not send invite.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await revokeInvite(id);
      await refresh();
    } catch (err) {
      setMessage({
        tone: "err",
        text: err instanceof Error ? err.message : "Could not revoke invite.",
      });
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <form onSubmit={handleInvite} className="space-y-4">
          <Field label="Invite a clipper">
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or email"
                autoComplete="off"
              />
              <Button type="submit" disabled={busy || !identifier.trim()}>
                {busy ? "Sending…" : "Send invite"}
              </Button>
            </div>
          </Field>
          {message && (
            <p
              className={`text-sm ${
                message.tone === "ok" ? "text-status-success" : "text-status-error"
              }`}
            >
              {message.text}
            </p>
          )}
          <p className="text-xs text-ink-faint">
            Invited clippers still need a verified account — the invite skips the
            follower/engagement threshold, not fraud checks.
          </p>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm text-ink-faint">Loading invites…</p>
      ) : invites.length === 0 ? (
        <EmptyState
          title="No invites yet"
          body="Invite clippers by username or email. They'll see this campaign in their dashboard once invited."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line/10 text-left text-xs uppercase tracking-wider text-ink-faint">
                  <th className="px-4 py-3 font-semibold">Clipper</th>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-b border-line/5 last:border-0">
                    <td className="px-4 py-3">{inv.email ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{inv.code}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONES[inv.status]}>{inv.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === "pending" && (
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="text-xs font-medium text-status-error hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
