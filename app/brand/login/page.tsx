"use client";
import { useState } from "react";
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
  const router = useRouter();

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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-2xl font-black text-ink">C</div>
        <h1 className="display text-2xl">Brand sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Access your ClipForge brand dashboard — campaigns, verified views, billing.
        </p>
        <div className="mt-8">
          <Button onClick={signIn} disabled={loading} variant="lime" className="w-full py-3">
            <GoogleLogo /> {loading ? "Redirecting…" : "Continue with Google"}
          </Button>
        </div>
        <p className="mt-6 text-xs text-ink-faint">
          Brand accounts are provisioned by our team. New here?{" "}
          <Link href="/brand/request" className="font-semibold text-lime-deep hover:text-ink">
            Request brand access
          </Link>
          .
        </p>
        {!isLive && (
          <p className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
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
