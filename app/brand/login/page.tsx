"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

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

/** Separate brand entry point (hard role separation, like clipping.net's client login). */
export default function BrandLoginPage() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        // Don't gate on role here — requireBrand() in the brand layout
        // auto-provisions brand access on first visit. A fresh Google signup
        // via this page still has the default role until then.
        setSession({
          email: data.user.email ?? "",
          role: "brand",
        });
      }
      setChecking(false);
    });
  }, []);

  async function signIn() {
    if (!isLive) {
      router.push("/brand");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/brand` },
    });
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md p-8 text-center">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          CLIPFORGE
        </Link>
        <h1 className="display mt-4 text-2xl">Brand sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Access your ClipForge brand dashboard — campaigns, verified views, billing.
        </p>
        {checking ? (
          <div className="mt-8 flex justify-center py-3">
            <span className="text-sm text-ink-faint">Checking session…</span>
          </div>
        ) : session ? (
          <div className="mt-8">
            <p className="text-sm text-ink-soft">
              Signed in as <span className="font-semibold text-ink">{session.email}</span>
            </p>
            <Button onClick={() => router.push("/brand")} variant="primary" className="mt-4 w-full py-3">
              Continue to brand dashboard
            </Button>
            <button
              onClick={signOut}
              className="mt-4 w-full py-2 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Use a different account
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <Button onClick={signIn} disabled={loading} variant="primary" className="w-full py-3">
              <GoogleLogo /> {loading ? "Redirecting…" : "Continue with Google"}
            </Button>
          </div>
        )}
        <p className="mt-6 text-xs text-ink-faint">
          Brand accounts are provisioned by our team. New here?{" "}
          <Link href="/brand/request" className="font-semibold text-ink-soft hover:text-ink">
            Request brand access
          </Link>
          .
        </p>
        {!isLive && (
          <p className="mt-4 rounded-md border border-status-warning/25 bg-status-warning/10 px-3 py-2 text-xs text-ink-soft">
            Demo mode: Supabase isn&apos;t configured, so this signs you into a demo brand dashboard.
          </p>
        )}
        <div className="mt-6 border-t border-line/10 pt-4 text-xs text-ink-faint">
          Are you a clipper?{" "}
          <Link href="/login" className="font-semibold text-ink-soft hover:text-ink">
            Sign in as a clipper →
          </Link>
        </div>
      </Card>
    </div>
  );
}
