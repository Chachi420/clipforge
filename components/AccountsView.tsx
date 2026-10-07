"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Copy, Plus } from "lucide-react";
import Header from "@/components/Header";
import { Badge, Button, Card, Dialog, Field, PlatformDot, inputCls } from "@/components/ui";
import { connectSocialAccount, removeSocialAccount, verifySocialAccount, MIN_FOLLOWERS } from "@/lib/actions";
import { PLATFORM_LABELS, type Platform, type SocialAccount } from "@/lib/types";

const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

const BIO_INSTRUCTIONS: Record<Platform, string> = {
  tiktok: "Open TikTok → profile → Edit profile → Bio. Paste the code anywhere in your bio.",
  instagram: "Open Instagram → profile → Edit profile → Bio. Paste the code anywhere in your bio.",
  youtube: "Open YouTube Studio → Customization → Basic info → Description. Paste the code anywhere in your channel description.",
  x: "Open X → profile → Edit profile → Bio. Paste the code anywhere in your bio.",
};

function AccountCard({ account }: { account: SocialAccount }) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; reason?: string; manual?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function copyCode() {
    navigator.clipboard.writeText(account.verificationCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleRemove() {
    if (!confirm("Remove this account? Its clips will stop counting toward payouts.")) return;
    try {
      await removeSocialAccount(account.id);
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "Could not remove.");
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setResult(null);
    try {
      const r = await verifySocialAccount(account.id);
      setResult(r);
      if (r.ok) router.refresh();
    } catch (e: any) {
      setResult({ ok: false, reason: e.message ?? "Verification failed." });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-semibold">
          <PlatformDot platform={account.platform} /> {PLATFORM_LABELS[account.platform]}
        </span>
        <Badge tone={account.verified ? "green" : "amber"}>
          {account.verified ? "Active" : "Pending"}
        </Badge>
      </div>
      <div className="mt-3 font-mono text-sm text-white/70">{account.handle}</div>
      {account.verified && account.followerCount > 0 && (
        <div className="mt-1 text-xs text-white/40">
          {account.followerCount.toLocaleString()} followers
        </div>
      )}

      {!account.verified && (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-300/90">
            Step 1 — add this code to your bio
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
            <code className="font-mono text-base font-bold tracking-widest text-white">
              {account.verificationCode}
            </code>
            <button onClick={copyCode} className="flex items-center gap-1 text-xs text-white/60 hover:text-white">
              <Copy size={13} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/50">{BIO_INSTRUCTIONS[account.platform]}</p>
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-300/90">
              Step 2 — verify
            </div>
            {account.platform === "youtube" ? (
              <Button onClick={handleVerify} disabled={verifying} className="mt-2 w-full py-2 text-sm">
                <BadgeCheck size={15} /> {verifying ? "Checking bio…" : "Verify now"}
              </Button>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                Our review bot checks YouTube automatically. For {PLATFORM_LABELS[account.platform]},
                add the code to your bio — the account is activated by manual review
                (needs {MIN_FOLLOWERS.toLocaleString()}+ followers).
              </p>
            )}
          </div>
          {result && !result.ok && (
            <p className={`mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${result.manual ? "bg-white/5 text-white/60" : "bg-red-500/10 text-red-300"}`}>
              {result.reason}
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={handleRemove}
          className="w-full rounded-lg bg-white/5 py-1.5 text-xs font-medium text-red-300/80 hover:bg-white/10"
        >
          Remove
        </button>
      </div>
    </Card>
  );
}

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

  return (
    <>
      <Header title="Accounts" subtitle="Connect the accounts you post clips from" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="max-w-xl text-sm text-white/50">
            Only clips posted from <span className="font-semibold text-white/75">verified accounts</span> count
            toward payouts. Add an account, put your verification code in its bio, and verify —
            accounts need at least {MIN_FOLLOWERS.toLocaleString()} followers.
          </p>
          <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Add account</Button>
        </div>
        {initial.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
            <p className="font-semibold text-white">No accounts connected</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">
              Connect the TikTok, Instagram, YouTube, or X accounts you post clips from,
              then verify each one with its bio code.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {initial.map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        )}
      </div>

      {showAdd && (
        <Dialog title="Connect account" subtitle="You'll get a verification code for its bio" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field label="Platform">
              <div className="flex flex-wrap gap-2">
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
