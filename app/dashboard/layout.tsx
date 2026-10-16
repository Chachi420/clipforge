import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardChrome";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isLive } from "@/lib/db";
import { getUserRole } from "@/lib/brand-db";
import { profile as mockProfile } from "@/lib/mock";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let profile = mockProfile;
  if (isLive()) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    // One role per account: brand-role users belong on the brand side.
    try {
      const role = await Promise.race([
        getUserRole(user.id),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("role timeout")), 5000)
        ),
      ]);
      if (role === "brand") redirect("/brand");
    } catch (e) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
      // Role check failed — let the page load; don't block on infra hiccups.
    }
    const p = await getProfile(user.id);
    if (p) {
      profile = p;
    } else {
      // Profile trigger hasn't run yet — synthesize from the auth user.
      profile = {
        ...mockProfile,
        id: user.id,
        email: user.email ?? "",
        displayName:
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          (user.email ?? "Clipper").split("@")[0],
        avatarUrl: (user.user_metadata?.avatar_url as string) ?? "",
        clipsSubmitted: 0,
      };
    }
  }
  return (
    <DashboardShell
      profile={{
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      }}
    >
      {children}
    </DashboardShell>
  );
}
