"use client";

import { useEffect, useState } from "react";
import { Button, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { completeBrandOnboarding } from "@/lib/brand-actions";

/**
 * First-login modal for brands: captures the brand (company) name and the
 * operator's own name separately — the person running the account often
 * isn't the brand name itself. The name field is pre-filled from the
 * Google account and remains editable.
 */
export default function BrandOnboardingModal() {
  const [brandName, setBrandName] = useState("");
  const [userName, setUserName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill the operator name from the Google account (editable).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const meta = (data.user as any)?.user_metadata;
      const googleName = meta?.full_name || meta?.name || "";
      if (googleName) setUserName(googleName);
    });
  }, []);

  const valid = brandName.trim().length > 0 && userName.trim().length > 0;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await completeBrandOnboarding(brandName.trim(), userName.trim());
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Set up your brand account"
    >
      <div className="w-full max-w-md rounded-2xl border border-line/10 bg-paper p-6 shadow-xl sm:p-8">
        <h2 className="display text-2xl">Welcome to Wondeed</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Two quick things before you start running campaigns.
        </p>
        <div className="mt-6 space-y-4">
          <Field label="Brand name" >
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Acme Studios"
              className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
              autoFocus
            />
          </Field>
          <Field label="Your name" >
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full rounded-lg border border-line/15 bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/40"
            />
          </Field>
        </div>
        {error && (
          <p className="mt-4 text-sm text-status-error">{error}</p>
        )}
        <Button
          onClick={submit}
          disabled={!valid || busy}
          className="mt-6 w-full"
        >
          {busy ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
