"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, Users } from "lucide-react";
import Header from "@/components/Header";
import { Button, Card, Dialog, Field, inputCls } from "@/components/ui";
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
      <Header title="Teams" subtitle="Create a team and earn commissions" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex justify-end">
          <Button variant="electric" onClick={() => setShowCreate(true)}><Plus size={15} /> Create team</Button>
        </div>
        {initial.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line/20 px-6 py-14 text-center">
            <Users size={28} className="mb-3 text-ink-faint" />
            <div className="text-base font-semibold text-ink">No team created</div>
            <p className="mt-2 max-w-sm text-sm text-ink-faint">
              Create a team to start earning commissions from referrals. Share your referral link
              and earn a cut of everything your team earns.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {initial.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="font-bold text-ink">{t.name}</div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-line/10 bg-surface-deep/70 px-3 py-2">
                  <code className="font-mono text-sm text-ink-soft">{t.referralCode}</code>
                  <button
                    onClick={() => copyCode(t.referralCode)}
                    className="flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
                  >
                    <Copy size={13} /> {copied === t.referralCode ? "Copied!" : "Copy link"}
                  </button>
                </div>
                <div className="mt-3 text-xs text-ink-faint">
                  Share this referral link with new clippers to earn commissions.
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <Dialog title="Create team" subtitle="Teams earn commission on referred clippers" onClose={() => setShowCreate(false)}>
          <Field label="Team name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Night Shift Clippers" />
          </Field>
          {error && <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={!name.trim() || saving} onClick={handleCreate}>
              {saving ? "Creating…" : "Create team"}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
