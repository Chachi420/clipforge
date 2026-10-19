"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Copy, Plus } from "lucide-react";
import Header from "@/components/Header";
import { Badge, Button, Card, Dialog, EmptyState, Field, PlatformDot, inputCls } from "@/components/ui";
import { connectSocialAccount, removeSocialAccount, verifySocialAccount } from "@/lib/actions";
import type { VerifyResult } from "@/lib/actions";
import { PLATFORM_LABELS, type Platform, type SocialAccount } from "@/lib/types";

const PLATFORMS: Platform[] = ["instagram", "youtube"];

const BIO_INSTRUCTIONS: Record<Platform, string> = {
  tiktok: "Open TikTok → profile → Edit profile → Bio. Paste the code anywhere in your bio.",
  instagram: "Open Instagram → profile → Edit profile → Bio. Paste the code anywhere in your bio.",
  youtube: "Open YouTube Studio → Customization → Basic info → Description. Paste the code anywhere in your channel description.",
  x: "Open X → profile → Edit profile → Bio. Paste the code anywhere in your bio.",
};

function AccountCard({ account }: { account: SocialAccount }) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  // Seconds until the server unlocks the bio check (3-min gate), then auto-retry.
  const [waitLeft, setWaitLeft] = useState<number | null>(null);
  // Client-side cooldown after each bio scrape — bounds verification spend.
  const [cooldownLeft, setCooldownLeft] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (waitLeft === null) return;
    if (waitLeft <= 0) {
      setWaitLeft(null);
      void handleVerify();
      return;
    }
    const t = setTimeout(() => setWaitLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [waitLeft]);

  useEffect(() => {
    if (cooldownLeft === null) return;
    if (cooldownLeft <= 0) {
      setCooldownLeft(null);
      return;
    }
    const t = setTimeout(() => setCooldownLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldownLeft]);

  function copyCode() {
    navigator.clipboard.writeText(account.verificationCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleRemove() {
    if (!confirm("Remove this account? Its clips will stop counting toward payouts.")) return;
    setRemoveError(null);
    try {
      await removeSocialAccount(account.id);
      router.refresh();
    } catch (e: any) {
      setRemoveError(e.message ?? "Could not remove.");
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setResult(null);
    try {
      const r = await verifySocialAccount(account.id);
      if (!r.ok && r.waiting) {
        // Server gate: the code hasn't been out for 3 minutes yet. Count
        // down, then retry automatically — the clipper just waits.
        setWaitLeft(r.waitSeconds ?? 60);
        setResult({ ok: false, reason: r.reason });
      } else {
        setResult(r);
        if (r.ok) {
          router.refresh();
        } else if (!r.manual) {
          // 45s cooldown before the next bio scrape (each check costs an Apify run).
          setCooldownLeft(45);
        }
      }
    } catch (e: any) {
      setResult({ ok: false, reason: e.message ?? "Verification failed." });
    } finally {
      setVerifying(false);
    }
  }

  const autoCheck = account.platform === "youtube" || account.platform === "instagram";
  const busy = verifying || waitLeft !== null || cooldownLeft !== null;
  const verifyLabel = verifying
    ? "Checking bio…"
    : waitLeft !== null
      ? `Checking in ${waitLeft}s…`
      : cooldownLeft !== null
        ? `Try again in ${cooldownLeft}s`
        : "Verify now";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold text-ink">
          <PlatformDot platform={account.platform} /> {PLATFORM_LABELS[account.platform]}
        </span>
        <Badge tone={account.verified ? "success" : "warning"}>
          {account.verified ? "Active" : "Pending"}
        </Badge>
      </div>
      <div className="mt-3 truncate font-mono text-sm text-ink-soft">{account.handle}</div>
      {account.verified && account.followerCount > 0 && (
        <div className="tnum mt-1 text-xs text-ink-faint">
          {account.followerCount.toLocaleString()} followers
        </div>
      )}

      {!account.verified && (
        <div className="mt-4 rounded-card border border-status-warning/25 bg-status-warning/10 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-status-warning">
            Step 1 — add this code to your bio
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-white/10 bg-night/90 px-3 py-2">
            <code className="tnum truncate font-mono text-base font-bold tracking-widest text-white">
              {account.verificationCode}
            </code>
            <button onClick={copyCode} className="flex shrink-0 items-center gap-1 text-xs text-white/60 hover:text-white">
              <Copy size={13} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">{BIO_INSTRUCTIONS[account.platform]}</p>
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-status-warning">
              Step 2 — verify
            </div>
            {autoCheck ? (
              <Button variant="primary" onClick={handleVerify} disabled={busy} className="mt-2 w-full py-2 text-sm">
                <BadgeCheck size={15} /> {verifyLabel}
              </Button>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Our review bot checks YouTube and Instagram automatically. For {PLATFORM_LABELS[account.platform]},
                add the code to your bio — the account is activated once the code is found.
              </p>
            )}
          </div>
          {result && !result.ok && (
            <p className={`mt-2 rounded-md px-3 py-2 text-xs leading-relaxed ${result.manual ? "bg-ink/5 text-ink-soft" : "bg-status-error/10 text-status-error"}`}>
              {result.reason}
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={handleRemove}
          className="w-full rounded-full bg-ink/5 py-1.5 text-xs font-medium text-status-error hover:bg-ink/10"
        >
          Remove
        </button>
        {removeError && (
          <p role="alert" className="mt-2 text-xs text-status-error">
            {removeError}
          </p>
        )}
      </div>
    </Card>
  );
}

export default function AccountsView({ initial }: { initial: SocialAccount[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [platform, setPlatform] = useState<Platform>("instagram");
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
      <Header
        title="Accounts"
        subtitle="Connect the accounts you post clips from"
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)} className="shrink-0">
            <Plus size={15} /> Add account
          </Button>
        }
      />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6">
          <p className="max-w-xl text-sm text-ink-faint">
            Only clips posted from <span className="font-semibold text-ink">verified accounts</span> count
            toward payouts. Add an account, put your verification code in its bio, and verify.
          </p>
        </div>
        {initial.length === 0 ? (
          <EmptyState
            title="No accounts connected"
            body="Connect the Instagram or YouTube accounts you post clips from, then verify each one with its bio code."
          />
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
                    className={`min-h-[44px] rounded-full px-3 py-1.5 text-sm capitalize ${platform === p ? "bg-ink font-semibold text-paper" : "bg-ink/5 text-ink-soft hover:bg-ink/10"}`}>
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Handle">
              <input className={inputCls} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourhandle" />
            </Field>
            {error && <p className="rounded-md bg-status-error/10 px-3 py-2 text-sm text-status-error">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" disabled={saving || !handle.trim()} onClick={handleAdd}>
                {saving ? "Connecting…" : "Connect account"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
