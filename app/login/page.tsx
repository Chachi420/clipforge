"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import type { AuthProvider } from "@/lib/types";

// NEXT_PUBLIC_ vars are inlined at build time, so this is client-safe.
const isLive = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.7 2.9-.1.1C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.7-2.9-.1.1C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.3l3.9-2.9z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.7l3.9 2.9c1-2.9 3.7-4.9 6.8-4.9z" />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#f35325" d="M1 1h10.5v10.5H1z" />
      <path fill="#81bc06" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#05a6f0" d="M1 12.5h10.5V23H1z" />
      <path fill="#ffba08" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState<AuthProvider | null>(null);
  const router = useRouter();

  async function signIn(provider: AuthProvider) {
    if (!isLive) {
      // Demo mode: no Supabase configured — go straight to the dashboard.
      router.push("/dashboard");
      return;
    }
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="glass glass-sheen w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-2xl font-black text-ink">C</div>
        <h1 className="display text-2xl">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-faint">
          Sign in as a clipper with your Google or Microsoft account.
        </p>
        <div className="mt-8 space-y-3">
          <Button variant="lime" onClick={() => signIn("google")} disabled={loading !== null} className="w-full py-3">
            <GoogleLogo /> {loading === "google" ? "Redirecting…" : "Continue with Google"}
          </Button>
          <Button onClick={() => signIn("azure")} disabled={loading !== null} variant="outline" className="w-full py-3">
            <MicrosoftLogo /> {loading === "azure" ? "Redirecting…" : "Continue with Microsoft"}
          </Button>
        </div>
        <p className="mt-6 text-xs text-ink-faint">
          Don&apos;t worry — we&apos;ll check if you already have an account. If not, we&apos;ll get you started.
        </p>
        {!isLive && (
          <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Demo mode: Supabase isn&apos;t configured, so this signs you into a demo dashboard.
          </p>
        )}
        <div className="mt-6 border-t border-line/10 pt-4 text-xs text-ink-faint">
          Are you a brand? <span className="cursor-pointer font-semibold text-ink-soft hover:text-ink">Sign in as a client →</span>
        </div>
      </div>
    </div>
  );
}
