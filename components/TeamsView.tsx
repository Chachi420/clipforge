"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus } from "lucide-react";
import Header from "@/components/Header";
import { Button, Card, Dialog, EmptyState, Field, inputCls } from "@/components/ui";
import { createTeam } from "@/lib/actions";
import type { Team } from "@/lib/types";

export default function TeamsView({ initial }: { initial: Team[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      await createTeam(name);
      setShowCreate(false);
      setName("");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Could not create team.");
    } finally {
      setSaving(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(`${window.location.origin}/login?ref=${code}`).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <Header
        title="Teams"
        subtitle="Create a team"
        action={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Create team
          </Button>
        }
      />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {initial.length === 0 ? (
          <EmptyState
            title="No team created"
            body="Create a team to organize clippers under one banner. Share your referral link to invite new clippers."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {initial.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="font-bold text-ink">{t.name}</div>
                <div className="mt-3 flex items-center justify-between gap-2 rounded-card border border-line/10 bg-surface-deep px-3 py-2">
                  <code className="tnum truncate font-mono text-sm text-ink-soft">{t.referralCode}</code>
                  <button
                    onClick={() => copyCode(t.referralCode)}
                    className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
                  >
                    <Copy size={13} /> {copied === t.referralCode ? "Copied!" : "Copy link"}
                  </button>
                </div>
                <div className="mt-3 text-xs text-ink-faint">
                  Share this referral link with new clippers.
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <Dialog title="Create team" subtitle="Invite clippers to your team" onClose={() => setShowCreate(false)}>
          <Field label="Team name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Night Shift Clippers" />
          </Field>
          {error && <p className="mt-3 rounded-md bg-status-error/10 px-3 py-2 text-sm text-status-error">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" disabled={!name.trim() || saving} onClick={handleCreate}>
              {saving ? "Creating…" : "Create team"}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
