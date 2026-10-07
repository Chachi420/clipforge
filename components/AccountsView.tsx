"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Header from "@/components/Header";
import { Badge, Button, Card, Dialog, Field, PlatformDot, inputCls } from "@/components/ui";
import { connectSocialAccount, removeSocialAccount } from "@/lib/actions";
import { PLATFORM_LABELS, type Platform, type SocialAccount } from "@/lib/types";

const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

export default function AccountsView({ initial }: { initial: SocialAccount[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAdd() {
    setSaving(true);
    setError(null);
    try {
      await connectSocialAccount(platform, handle);
      setShowAdd(false);
      setHandle("");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Could not add account.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this account? Its clips will stop counting toward payouts.")) return;
    try {
      await removeSocialAccount(id);
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "Could not remove.");
    }
  }

  return (
    <>
      <Header title="Accounts" subtitle="Manage your connected social accounts" />
      <div className="px-8 py-8">
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Add account</Button>
        </div>
        {initial.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
            <p className="font-semibold text-white">No accounts connected</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">
              Connect the TikTok, Instagram, YouTube, or X accounts you post clips from.
              Accounts are verified before their clips count toward payouts.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {initial.map((a) => (
              <Card key={a.id} className="p-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <PlatformDot platform={a.platform} /> {PLATFORM_LABELS[a.platform]}
                  </span>
                  <Badge tone={a.verified ? "green" : "amber"}>{a.verified ? "Verified" : "Pending"}</Badge>
                </div>
                <div className="mt-3 font-mono text-sm text-white/70">{a.handle}</div>
                <div className="mt-4">
                  <button
                    onClick={() => handleRemove(a.id)}
                    className="w-full rounded-lg bg-white/5 py-1.5 text-xs font-medium text-red-300/80 hover:bg-white/10"
                  >
                    Remove
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-6 text-xs text-white/35">
          Accounts must be verified before clips posted from them count toward payouts.
        </p>
      </div>

      {showAdd && (
        <Dialog title="Connect account" subtitle="Link an account you post clips from" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field label="Platform">
              <div className="flex gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm capitalize ${platform === p ? "bg-accent text-white" : "bg-white/5 text-white/60"}`}>
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Handle">
              <input className={inputCls} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourhandle" />
            </Field>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button disabled={saving || !handle.trim()} onClick={handleAdd}>
                {saving ? "Connecting…" : "Connect account"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
