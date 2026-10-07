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
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-base-850 p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl font-black text-white">C</div>
        <h1 className="text-2xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-white/55">
          Sign in as a clipper with your Google or Microsoft account.
        </p>
        <div className="mt-8 space-y-3">
          <Button onClick={() => signIn("google")} disabled={loading !== null} className="w-full py-3">
            {loading === "google" ? "Redirecting…" : "Continue with Google"}
          </Button>
          <Button onClick={() => signIn("azure")} disabled={loading !== null} variant="outline" className="w-full py-3">
            {loading === "azure" ? "Redirecting…" : "Continue with Microsoft"}
          </Button>
        </div>
        <p className="mt-6 text-xs text-white/35">
          Don&apos;t worry — we&apos;ll check if you already have an account. If not, we&apos;ll get you started.
        </p>
        {!isLive && (
          <p className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Demo mode: Supabase isn&apos;t configured, so this signs you into a demo dashboard.
          </p>
        )}
        <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/40">
          Are you a brand? <span className="cursor-pointer font-semibold text-white/70 hover:text-white">Sign in as a client →</span>
        </div>
      </div>
    </div>
  );
}
