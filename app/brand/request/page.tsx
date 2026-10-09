import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBrandRequest } from "@/lib/brand-actions";
import { getUserRole } from "@/lib/brand-db";
import { Card } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import RequestForm from "./RequestForm";

export const dynamic = "force-dynamic";

/** Sales-led brand onboarding: sign in with Google, request access, we provision. */
export default async function BrandRequestPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/brand/login?next=/brand/request");

  // Already a brand? Go to the dashboard.
  if ((await getUserRole(user.id)) === "brand") redirect("/brand");

  const existing = await getMyBrandRequest();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-xl p-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric text-2xl font-black text-white">C</div>
        <h1 className="display text-center text-2xl">Request brand access</h1>
        {existing?.status === "pending" ? (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 text-center">
            <p className="font-semibold text-amber-700 dark:text-amber-200">Request under review</p>
            <p className="mt-2 text-sm text-ink-soft">
              Your request for <span className="font-semibold text-ink">{existing.company_name}</span> is
              being reviewed. We&apos;ll enable your brand dashboard as soon as it&apos;s approved.
            </p>
          </div>
        ) : existing?.status === "approved" ? (
          <div className="mt-8 text-center">
            <p className="font-semibold text-emerald-600 dark:text-emerald-300">You&apos;re approved!</p>
            <Link href="/brand" className="mt-4 inline-block rounded-full bg-electric px-6 py-3 text-sm font-bold text-white transition hover:bg-electric-soft">
              Open your brand dashboard
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-center text-sm text-ink-soft">
              Tell us about your company. We provision every brand account by hand to keep
              campaign quality high.
            </p>
            <RequestForm defaultEmail={user.email ?? ""} />
          </>
        )}
        <p className="mt-6 text-center text-xs text-ink-faint">
          <Link href="/brand/login" className="font-semibold text-ink-soft hover:text-ink">
            ← Back to brand sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
